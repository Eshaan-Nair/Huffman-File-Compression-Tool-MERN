const pdf = require('pdf-parse');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Extract text from PDF with page information
async function extractTextFromPDF(pdfBuffer) {
  try {
    const data = await pdf(pdfBuffer, {
      max: 0, // Extract all pages
      version: 'default'
    });
    
    // Return text with some metadata
    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info
    };
  } catch (error) {
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

// Create PDF from text with better formatting
function createPDFFromText(textData, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 72,
          bottom: 72,
          left: 72,
          right: 72
        }
      });
      
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Parse text data if it's an object
      let text = typeof textData === 'string' ? textData : textData.text || textData;
      
      // Set font size - don't explicitly set font to avoid path issues
      doc.fontSize(11);

      // Split text into lines to preserve line breaks
      const lines = text.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if we need a new page
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }
        
        // Preserve empty lines
        if (line.trim() === '') {
          doc.moveDown(0.5);
        } else {
          // Add text with word wrap
          doc.text(line, {
            width: doc.page.width - 144, // Account for margins
            align: 'left',
            lineGap: 2
          });
        }
      }

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