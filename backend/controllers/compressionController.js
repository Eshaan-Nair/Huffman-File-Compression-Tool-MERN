const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const unzipper = require('unzipper');
const { compress, decompress } = require('../utils/huffman');

// Compress file endpoint - creates ZIP with compressed data and codes
const compressFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileData = fs.readFileSync(filePath, 'utf8');

    // Perform compression
    const { compressedData, codes, originalLength, encodedLength } = compress(fileData);

    // Create temporary files
    const timestamp = Date.now();
    const compressedFileName = `compressed_data.bin`;
    const codesFileName = `codes.json`;
    const tempCompressedPath = path.join(__dirname, '../uploads', `temp_${timestamp}_compressed.bin`);
    const tempCodesPath = path.join(__dirname, '../uploads', `temp_${timestamp}_codes.json`);

    // Write temporary files
    fs.writeFileSync(tempCompressedPath, compressedData);
    fs.writeFileSync(tempCodesPath, JSON.stringify({
      codes,
      originalLength,
      encodedLength,
      originalFileName: req.file.originalname
    }, null, 2));

    // Create ZIP file with original filename (include timestamp in actual filename)
    const originalBaseName = path.parse(req.file.originalname).name;
    const actualZipFileName = `${originalBaseName}_${timestamp}.zip`;
    const displayZipFileName = `${originalBaseName}.zip`;
    const zipFilePath = path.join(__dirname, '../uploads', actualZipFileName);
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
      fs.unlinkSync(tempCompressedPath);
      fs.unlinkSync(tempCodesPath);

      // Get the actual filename that was saved
      const actualFileName = path.basename(zipFilePath);

      res.json({
        success: true,
        message: 'File compressed successfully',
        stats: {
          originalSize,
          compressedSize,
          compressionRatio: `${compressionRatio}%`,
          spaceSaved
        },
        file: actualFileName,
        displayName: displayZipFileName
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.file(tempCompressedPath, { name: compressedFileName });
    archive.file(tempCodesPath, { name: codesFileName });
    archive.finalize();

  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ 
      error: 'Compression failed', 
      message: error.message 
    });
  }
};

// Decompress file endpoint - extracts ZIP and decompresses
const decompressFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded' 
      });
    }

    const zipFilePath = req.file.path;
    const extractPath = path.join(__dirname, '../uploads', `extract_${Date.now()}`);
    
    // Create extraction directory
    fs.mkdirSync(extractPath, { recursive: true });

    // Extract ZIP file
    await fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    // Read extracted files
    const compressedDataPath = path.join(extractPath, 'compressed_data.bin');
    const codesPath = path.join(extractPath, 'codes.json');

    if (!fs.existsSync(compressedDataPath) || !fs.existsSync(codesPath)) {
      throw new Error('Invalid ZIP file structure. Missing required files.');
    }

    const compressedData = fs.readFileSync(compressedDataPath);
    const metadata = JSON.parse(fs.readFileSync(codesPath, 'utf8'));
    const { codes, originalLength } = metadata;

    // Perform decompression
    const decompressedData = decompress(compressedData, codes, originalLength);

    // Use original filename from metadata
    const originalName = metadata.originalFileName || 'decompressed.txt';
    const decompressedFileName = `${Date.now()}_${originalName}`;
    const decompressedFilePath = path.join(__dirname, '../uploads', decompressedFileName);
    fs.writeFileSync(decompressedFilePath, decompressedData);

    // Clean up
    fs.unlinkSync(zipFilePath);
    fs.rmSync(extractPath, { recursive: true, force: true });

    res.json({
      success: true,
      message: 'File decompressed successfully',
      file: decompressedFileName,
      originalFileName: originalName
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

    // Determine the display filename (without timestamp prefix for decompressed files)
    let displayName = filename;
    
    // If it's a decompressed file (has timestamp prefix), extract original name
    if (filename.match(/^\d+_/)) {
      displayName = filename.replace(/^\d+_/, '');
    }

    res.download(filePath, displayName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Download failed' });
        }
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