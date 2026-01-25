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
    const extractedData = await extractTextFromPDF(pdfBuffer);
    const fileData = typeof extractedData === 'string' ? extractedData : extractedData.text;

    if (!fileData || fileData.trim().length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'PDF is empty or contains no extractable text' });
    }

    // Perform compression
    const { compressedData, codes, originalLength, encodedLength } = compress(fileData);

    // Get original filename without extension
    const originalName = path.parse(req.file.originalname).name;
    
    console.log('Original file uploaded:', req.file.originalname);
    console.log('Name for ZIP:', originalName);

    // Create single compressed file with embedded metadata
    // Format: [metadata_length (4 bytes)][metadata_json][compressed_data]
    const metadataObj = {
      codes,
      originalLength,
      encodedLength,
      originalFileName: req.file.originalname, // Full original filename with extension
      timestamp: Date.now()
    };
    const metadataStr = JSON.stringify(metadataObj);
    const metadataBuffer = Buffer.from(metadataStr, 'utf8');
    const metadataLength = Buffer.alloc(4);
    metadataLength.writeUInt32BE(metadataBuffer.length, 0);

    // Combine metadata and compressed data
    const combinedData = Buffer.concat([metadataLength, metadataBuffer, compressedData]);

    // Save combined file
    const combinedFileName = `${originalName}_compressed.dat`;
    const combinedFilePath = path.join(__dirname, '../uploads', combinedFileName);
    fs.writeFileSync(combinedFilePath, combinedData);

    // Create ZIP file with the same name as original PDF
    const zipFileName = `${originalName}.zip`;
    const zipFilePath = path.join(__dirname, '../uploads', zipFileName);

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
      fs.unlinkSync(combinedFilePath);

      res.json({
        success: true,
        message: 'PDF compressed successfully',
        stats: {
          originalSize,
          compressedSize,
          compressionRatio: `${compressionRatio}%`,
          spaceSaved
        },
        file: zipFileName,
        originalFileName: req.file.originalname
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.file(combinedFilePath, { name: 'compressed.dat' });
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

    // Read the combined compressed file
    const combinedDataPath = path.join(extractDir, 'compressed.dat');

    if (!fs.existsSync(combinedDataPath)) {
      fs.unlinkSync(zipFilePath);
      fs.rmSync(extractDir, { recursive: true, force: true });
      return res.status(400).json({ 
        error: 'Invalid compressed file. Missing required data.' 
      });
    }

    // Read combined file
    const combinedData = fs.readFileSync(combinedDataPath);

    // Extract metadata length (first 4 bytes)
    const metadataLength = combinedData.readUInt32BE(0);

    // Extract metadata
    const metadataBuffer = combinedData.slice(4, 4 + metadataLength);
    const metadata = JSON.parse(metadataBuffer.toString('utf8'));

    // Extract compressed data
    const compressedData = combinedData.slice(4 + metadataLength);

    const { codes, originalLength, originalFileName } = metadata;

    console.log('Metadata from ZIP:', metadata);
    console.log('Original filename:', originalFileName);

    // Perform decompression
    const decompressedData = decompress(compressedData, codes, originalLength);

    // Use original filename - ensure it has .pdf extension
    let decompressedFileName;
    if (originalFileName) {
      // Keep exact original filename
      decompressedFileName = originalFileName;
      console.log('Using original filename:', decompressedFileName);
    } else {
      // Fallback if no original filename
      decompressedFileName = `decompressed_${timestamp}.pdf`;
      console.log('Using fallback filename:', decompressedFileName);
    }

    const decompressedFilePath = path.join(__dirname, '../uploads', decompressedFileName);
    
    // Create PDF from decompressed text
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
      if (err && !res.headersSent) {
        console.error('Download error:', err);
        return res.status(500).json({ error: 'Download failed' });
      }
      // Delete file after download
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (cleanupErr) {
          console.error('Cleanup error:', cleanupErr);
        }
      }, 2000);
    });

  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Download failed' });
    }
  }
};

module.exports = {
  compressFile,
  decompressFile,
  downloadFile
};