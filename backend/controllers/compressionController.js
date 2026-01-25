const fs = require('fs');
const path = require('path');
const { compress, decompress } = require('../utils/huffman');

// Compress file endpoint
const compressFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileData = fs.readFileSync(filePath, 'utf8');

    // Perform compression
    const { compressedData, codes, originalLength, encodedLength } = compress(fileData);

    // Save compressed file
    const compressedFileName = `compressed_${Date.now()}.bin`;
    const compressedFilePath = path.join(__dirname, '../uploads', compressedFileName);
    fs.writeFileSync(compressedFilePath, compressedData);

    // Save codes file (metadata)
    const codesFileName = `codes_${Date.now()}.json`;
    const codesFilePath = path.join(__dirname, '../uploads', codesFileName);
    fs.writeFileSync(codesFilePath, JSON.stringify({
      codes,
      originalLength,
      encodedLength,
      originalFileName: req.file.originalname
    }));

    // Calculate compression stats
    const originalSize = fs.statSync(filePath).size;
    const compressedSize = fs.statSync(compressedFilePath).size;
    const compressionRatio = ((compressedSize / originalSize) * 100).toFixed(2);
    const spaceSaved = originalSize - compressedSize;

    // Delete original uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File compressed successfully',
      stats: {
        originalSize,
        compressedSize,
        compressionRatio: `${compressionRatio}%`,
        spaceSaved
      },
      files: {
        compressedFile: compressedFileName,
        codesFile: codesFileName
      }
    });

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
    if (!req.files || !req.files.compressedFile || !req.files.codesFile) {
      return res.status(400).json({ 
        error: 'Both compressed file and codes file are required' 
      });
    }

    const compressedFilePath = req.files.compressedFile[0].path;
    const codesFilePath = req.files.codesFile[0].path;

    // Read compressed data
    const compressedData = fs.readFileSync(compressedFilePath);

    // Read codes and metadata
    const metadata = JSON.parse(fs.readFileSync(codesFilePath, 'utf8'));
    const { codes, originalLength } = metadata;

    // Perform decompression
    const decompressedData = decompress(compressedData, codes, originalLength);

    // Save decompressed file
    const decompressedFileName = `decompressed_${Date.now()}.txt`;
    const decompressedFilePath = path.join(__dirname, '../uploads', decompressedFileName);
    fs.writeFileSync(decompressedFilePath, decompressedData);

    // Delete uploaded files
    fs.unlinkSync(compressedFilePath);
    fs.unlinkSync(codesFilePath);

    res.json({
      success: true,
      message: 'File decompressed successfully',
      file: decompressedFileName,
      originalFileName: metadata.originalFileName || 'unknown'
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