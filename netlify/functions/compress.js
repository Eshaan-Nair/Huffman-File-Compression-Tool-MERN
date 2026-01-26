const multipart = require('parse-multipart-data');
const { compress } = require('./huffman');  // Local in functions/
const archiver = require('archiver');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const parts = multipart.parse(Buffer.from(event.body, 'base64'), boundary);
    const filePart = parts.find(part => part.name === 'file');
    if (!filePart) return { statusCode: 400, headers, body: JSON.stringify({ error: 'No file uploaded' }) };

    const fileBuffer = filePart.data;
    const fileName = filePart.filename;
    if (!fileName.toLowerCase().endsWith('.txt')) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Only .txt files are allowed' }) };

    const fileData = fileBuffer.toString('utf-8').trim();
    if (fileData.length === 0) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Text file is empty' }) };

    const [compressedData, codes, originalLength] = compress(fileData);  // Updated return

    const metadataObj = { codes, originalLength, originalFileName: fileName, timestamp: Date.now() };
    const metadataStr = JSON.stringify(metadataObj);
    const metadataBuffer = Buffer.from(metadataStr, 'utf-8');
    const metadataLength = Buffer.alloc(4);
    metadataLength.writeUInt32BE(metadataBuffer.length, 0);
    const combinedData = Buffer.concat([metadataLength, metadataBuffer, compressedData]);

    const chunks = [];
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('data', chunk => chunks.push(chunk));
    await new Promise((resolve, reject) => {
      archive.on('end', resolve);
      archive.on('error', reject);
      archive.append(combinedData, { name: 'compressed.dat' });
      archive.finalize();
    });

    const zipBuffer = Buffer.concat(chunks);
    const originalSize = fileBuffer.length;
    const compressedSize = zipBuffer.length;
    const compressionRatio = ((compressedSize / originalSize) * 100).toFixed(2);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Text file compressed successfully',
        stats: { originalSize, compressedSize, compressionRatio, spaceSaved: originalSize - compressedSize },
        zipData: zipBuffer.toString('base64'),
        fileName: fileName.replace('.txt', '.zip'),
        originalFileName: fileName
      })
    };
  } catch (error) {
    console.error('Compression error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Compression failed', message: error.message }) };
  }
};
