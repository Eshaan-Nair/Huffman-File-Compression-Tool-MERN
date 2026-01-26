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

// Configure multer for file uploads with validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    compress: ['.txt', '.text'],
    decompress: ['.zip']
  };

  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check based on endpoint
  if (req.path.includes('/compress')) {
    if (allowedTypes.compress.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed for compression'));
    }
  } else if (req.path.includes('/decompress')) {
    if (allowedTypes.decompress.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip files are allowed for decompression'));
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Huffman Compression API',
    version: '2.0.0',
    endpoints: {
      compress: 'POST /api/compress',
      decompress: 'POST /api/decompress',
      download: 'GET /api/download/:filename'
    }
  });
});

// Compress endpoint
app.post('/api/compress', upload.single('file'), compressFile);

// Decompress endpoint - now accepts single ZIP file
app.post('/api/decompress', upload.single('file'), decompressFile);

// Download endpoint
app.get('/api/download/:filename', downloadFile);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        message: 'File size must be less than 25MB'
      });
    }
    return res.status(400).json({ 
      error: 'Upload error',
      message: err.message 
    });
  }
  
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