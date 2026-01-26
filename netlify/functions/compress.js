const multipart = require('parse-multipart-data');
const { extractTextFromPDF, createPDFFromText } = require('../../backend/utils/pdfUtils');
const { compress } = require('../../backend/utils/huffman');
const archiver = require('archiver');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse multipart form data
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const parts = multipart.parse(Buffer.from(event.body, 'base64'), boundary);
    
    const filePart = parts.find(part => part.name === 'file');
    if (!filePart) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file uploaded' })
      };
    }

    const fileBuffer = filePart.data;
    const fileName = filePart.filename;

    // Check if PDF
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Only PDF files are allowed' })
      };
    }

    // Extract text from PDF
    const extractedData = await extractTextFromPDF(fileBuffer);
    const fileData = typeof extractedData === 'string' ? extractedData : extractedData.text;

    if (!fileData || fileData.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'PDF is empty or contains no extractable text' })
      };
    }

    // Perform compression
    const { compressedData, codes, originalLength, encodedLength } = compress(fileData);

    // Create metadata
    const metadataObj = {
      codes,
      originalLength,
      encodedLength,
      originalFileName: fileName,
      timestamp: Date.now()
    };

    const metadataStr = JSON.stringify(metadataObj);
    const metadataBuffer = Buffer.from(metadataStr, 'utf8');
    const metadataLength = Buffer.alloc(4);
    metadataLength.writeUInt32BE(metadataBuffer.length, 0);

    // Combine metadata and compressed data
    const combinedData = Buffer.concat([metadataLength, metadataBuffer, compressedData]);

    // Create ZIP in memory
    const chunks = [];
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('data', (chunk) => chunks.push(chunk));
    
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
    const spaceSaved = originalSize - compressedSize;

    // Return ZIP as base64
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'PDF compressed successfully',
        stats: {
          originalSize,
          compressedSize,
          compressionRatio: `${compressionRatio}%`,
          spaceSaved
        },
        zipData: zipBuffer.toString('base64'),
        fileName: fileName.replace('.pdf', '.zip'),
        originalFileName: fileName
      })
    };

  } catch (error) {
    console.error('Compression error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Compression failed',
        message: error.message
      })
    };
  }
};