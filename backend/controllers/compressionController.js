const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const unzipper = require('unzipper');
const { compress, decompress } = require('../utils/huffman');
const { extractTextFromPDF, createPDFFromText } = require('../utils/pdfUtils');

// Compress file endpoint
const compressFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    // Only accept PDF files
    if (fileExtension !== '.pdf') {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Extract text from PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const fileData = await extractTextFromPDF(pdfBuffer);

    if (!fileData || fileData.trim().length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'PDF is empty or contains no extractable text' });
    }

    // Perform compression
    const { compressedData, codes, originalLength, encodedLength } = compress(fileData);

    // Create temporary files
    const timestamp = Date.now();
    const compressedFileName = `compressed_data.bin`;
    const codesFileName = `codes.json`;
    const zipFileName = `compressed_${timestamp}.zip`;

    const compressedFilePath = path.join(__dirname, '../uploads', compressedFileName);
    const codesFilePath = path.join(__dirname, '../uploads', codesFileName);
    const zipFilePath = path.join(__dirname, '../uploads', zipFileName);

    // Save compressed data and codes temporarily
    fs.writeFileSync(compressedFilePath, compressedData);
    fs.writeFileSync(codesFilePath, JSON.stringify({
      codes,
      originalLength,
      encodedLength,
      originalFileName: req.file.originalname
    }));

    // Create ZIP file containing both compressed data and codes
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      // Calculate compression stats
      const originalSize = fs.statSync(filePath).size;
      const compressedSize = fs.statSync(zipFilePath).size;
      const compressionRatio = ((compressedSize / originalSize) * 100).toFixed(2);
      const spaceSaved = originalSize - compressedSize;

      // Clean up temporary files
      fs.unlinkSync(filePath);
      fs.unlinkSync(compressedFilePath);
      fs.unlinkSync(codesFilePath);

      res.json({
        success: true,
        message: 'PDF compressed successfully',
        stats: {
          originalSize,
          compressedSize,
          compressionRatio: `${compressionRatio}%`,
          spaceSaved
        },
        file: zipFileName
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.file(compressedFilePath, { name: 'compressed_data.bin' });
    archive.file(codesFilePath, { name: 'codes.json' });
    archive.finalize();

  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ 
      error: 'Compression failed', 
      message: error.message 
    });
  }
};

// Decompress file endpoint
const decompressFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const zipFilePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    // Only accept ZIP files
    if (fileExtension !== '.zip') {
      fs.unlinkSync(zipFilePath);
      return res.status(400).json({ error: 'Only ZIP files are allowed for decompression' });
    }

    const timestamp = Date.now();
    const extractDir = path.join(__dirname, '../uploads', `extract_${timestamp}`);
    
    // Create extraction directory
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir);
    }

    // Extract ZIP file
    await fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    // Read extracted files
    const compressedDataPath = path.join(extractDir, 'compressed_data.bin');
    const codesPath = path.join(extractDir, 'codes.json');

    if (!fs.existsSync(compressedDataPath) || !fs.existsSync(codesPath)) {
      // Clean up
      fs.unlinkSync(zipFilePath);
      fs.rmSync(extractDir, { recursive: true, force: true });
      return res.status(400).json({ 
        error: 'Invalid compressed file. Missing required data.' 
      });
    }

    // Read compressed data and codes
    const compressedData = fs.readFileSync(compressedDataPath);
    const metadata = JSON.parse(fs.readFileSync(codesPath, 'utf8'));
    const { codes, originalLength, originalFileName } = metadata;

    // Perform decompression
    const decompressedData = decompress(compressedData, codes, originalLength);

    // Create PDF from decompressed text
    const decompressedFileName = `decompressed_${timestamp}.pdf`;
    const decompressedFilePath = path.join(__dirname, '../uploads', decompressedFileName);
    
    await createPDFFromText(decompressedData, decompressedFilePath);

    // Clean up temporary files
    fs.unlinkSync(zipFilePath);
    fs.rmSync(extractDir, { recursive: true, force: true });

    res.json({
      success: true,
      message: 'PDF decompressed successfully',
      file: decompressedFileName,
      originalFileName: originalFileName || 'unknown.pdf'
    });

  } catch (error) {
    console.error('Decompression error:', error);
    res.status(500).json({ 
      error: 'Decompression failed', 
      message: error.message 
    });
  }
};

// Download file endpoint
const downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Download failed' });
      }
      // Delete file after download
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 1000);
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
};

module.exports = {
  compressFile,
  decompressFile,
  downloadFile
};