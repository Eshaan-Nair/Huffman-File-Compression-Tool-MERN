const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { compressFile, decompressFile, downloadFile } = require('./controllers/compressionController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Huffman Compression API',
    version: '1.0.0',
    endpoints: {
      compress: 'POST /api/compress',
      decompress: 'POST /api/decompress',
      download: 'GET /api/download/:filename'
    }
  });
});

// Compress endpoint
app.post('/api/compress', upload.single('file'), compressFile);

// Decompress endpoint
app.post('/api/decompress', upload.fields([
  { name: 'compressedFile', maxCount: 1 },
  { name: 'codesFile', maxCount: 1 }
]), decompressFile);

// Download endpoint
app.get('/api/download/:filename', downloadFile);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});