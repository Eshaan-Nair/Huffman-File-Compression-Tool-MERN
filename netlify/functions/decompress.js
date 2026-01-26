const multipart = require('parse-multipart-data');
const unzipper = require('unzipper');
const { decompress } = require('../../backend/utils/huffman');
const { Readable } = require('stream');
const path = require('path');

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

    const zipBuffer = filePart.data;
    const fileName = filePart.filename;

    // Check if ZIP
    if (!fileName.toLowerCase().endsWith('.zip')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Only ZIP files are allowed for decompression' })
      };
    }

    // Extract ZIP
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

    // Extract metadata length
    const metadataLength = combinedData.readUInt32BE(0);

    // Extract metadata
    const metadataBuffer = combinedData.slice(4, 4 + metadataLength);
    const metadata = JSON.parse(metadataBuffer.toString('utf8'));

    // Extract compressed data
    const compressedData = combinedData.slice(4 + metadataLength);

    const { codes, originalLength, originalFileName } = metadata;

    // Perform decompression
    const decompressedData = decompress(compressedData, codes, originalLength);

    // Create PDF from decompressed text
    const pdfBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      const PDFDocument = require('pdfkit');
      
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        font: 'Courier'
      });

      // commented out to use default font
      // doc.font('Times-Roman');
      doc.fontSize(11);

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const lines = decompressedData.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }
        
        if (line.trim() === '') {
          doc.moveDown(0.5);
        } else {
          doc.text(line, {
            width: doc.page.width - 144,
            align: 'left',
            lineGap: 2
          });
        }
      }

      doc.end();
    });

    // Return PDF as base64
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'PDF decompressed successfully',
        pdfData: pdfBuffer.toString('base64'),
        fileName: originalFileName || 'decompressed.pdf',
        originalFileName: originalFileName || 'unknown.pdf'
      })
    };

  } catch (error) {
    console.error('Decompression error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Decompression failed',
        message: error.message
      })
    };
  }
};
