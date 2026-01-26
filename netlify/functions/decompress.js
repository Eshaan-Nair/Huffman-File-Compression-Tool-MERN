const multipart = require('parse-multipart-data');
const unzipper = require('unzipper');
const decompress = require('./backend/utils/huffman');
const { Readable } = require('stream');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

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
    // Parse multipart
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const parts = multipart.parse(
      Buffer.from(event.body, 'base64'),
      boundary
    );

    const filePart = parts.find(part => part.name === 'file');
    if (!filePart) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file uploaded' })
      };
    }

    const zipBuffer = filePart.data;
    const fileName = filePart.filename;

    // Check if ZIP
    if (!fileName.toLowerCase().endsWith('.zip')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Only ZIP files are allowed' })
      };
    }

    // Extract ZIP in memory
    const directory = await unzipper.Open.buffer(zipBuffer);
    let combinedData = null;
    for (const file of directory.files) {
      if (file.path === 'compressed.dat') {
        combinedData = await file.buffer();
        break;
      }
    }

    if (!combinedData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid compressed file. Missing required data.' })
      };
    }

    // Extract metadata
    const metadataLength = combinedData.readUInt32BE(0);
    const metadataBuffer = combinedData.slice(4, 4 + metadataLength);
    const metadata = JSON.parse(metadataBuffer.toString('utf-8'));
    const compressedData = combinedData.slice(4 + metadataLength);

    const { codes, originalLength, originalFileName } = metadata;

    // Perform decompression
    const decompressedData = decompress(compressedData, codes, originalLength);

    // Return text as base64
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Text file decompressed successfully',
        textData: Buffer.from(decompressedData, 'utf-8').toString('base64'),
        fileName: originalFileName ? originalFileName.replace('.txt', '_decompressed.txt') : 'decompressed.txt',
        originalFileName: originalFileName || 'unknown.txt'
      })
    };
  } catch (error) {
    console.error('Decompression error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Decompression failed', message: error.message })
    };
  }
};
