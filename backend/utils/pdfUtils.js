const pdf = require('pdf-parse');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Extract text from PDF
async function extractTextFromPDF(pdfBuffer) {
  try {
    const data = await pdf(pdfBuffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

// Create PDF from text
function createPDFFromText(text, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);
      
      // Add text to PDF with proper formatting
      doc.fontSize(12);
      doc.text(text, {
        width: 500,
        align: 'left'
      });

      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(new Error('Failed to create PDF: ' + error.message));
    }
  });
}

module.exports = {
  extractTextFromPDF,
  createPDFFromText
};