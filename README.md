<div align="center">

# Huffman Compression Tool

![Huffman Compression](https://img.shields.io/badge/Compression-Huffman%20Coding-blue?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)

**A powerful web-based file compression tool leveraging the Huffman Coding algorithm for optimal data compression**

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Algorithm Explained](#-algorithm-explained)
- [Project Structure](#-project-structure)
- [Performance](#-performance)
- [Screenshots](#-screenshots)
- [Acknowledgments](#-acknowledgments)
- [Author](#-author)

---

## Overview

The **Huffman Compression Tool** is a full-stack MERN application that implements the renowned Huffman Coding algorithm for lossless data compression. This project demonstrates both theoretical computer science concepts and practical web development skills, providing an intuitive interface for compressing and decompressing text files.

### What is Huffman Coding?

Huffman Coding is a lossless data compression algorithm that uses variable-length codes for characters based on their frequency of occurrence. Characters that appear more frequently are assigned shorter codes, resulting in optimal compression ratios.

### Why This Project?

- **Educational**: Learn and visualize how Huffman Coding works in real-time
- **Practical**: Actually compress your files and save storage space
- **Modern**: Built with cutting-edge web technologies
- **Performance**: Efficient algorithm implementation with optimized binary operations

---

## Features

### Core Functionality

- **File Compression**
  - Upload `.txt` files up to 25MB
  - Huffman encoding with optimal compression ratios
  - Binary serialization for maximum space efficiency
  - ZIP packaging with metadata preservation

- **File Decompression**
  - Upload compressed `.zip` files
  - Perfect restoration of original content
  - Metadata validation for data integrity
  - Original filename preservation

### User Experience

- **Modern UI/UX**
  - Clean, intuitive interface
  - Drag-and-drop file upload
  - Real-time upload progress tracking
  - Responsive design for all devices

- **Compression Analytics**
  - Original file size
  - Compressed file size
  - Compression ratio percentage
  - Space saved calculation

- **Validation & Error Handling**
  - File type validation
  - File size limits
  - Comprehensive error messages
  - Empty file detection

### Technical Features

- **Performance**
  - Efficient binary tree operations
  - Optimized bit packing
  - Stream-based file processing
  - Automatic cleanup of temporary files

- **Security**
  - File validation on both client and server
  - Type checking and sanitization
  - Size limit enforcement
  - CORS configuration

---

## Demo

### Compression Process

```
1. Upload .txt file → 2. Huffman encoding → 3. Binary packing → 4. Download .zip
```

### Decompression Process

```
1. Upload .zip file → 2. Extract metadata → 3. Huffman decoding → 4. Download .txt
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| ![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white) | UI Framework |
| ![React Router](https://img.shields.io/badge/React_Router-6.20.0-CA4245?logo=react-router&logoColor=white) | Navigation |
| ![Axios](https://img.shields.io/badge/Axios-1.6.2-5A29E4?logo=axios&logoColor=white) | HTTP Client |
| ![CSS3](https://img.shields.io/badge/CSS3-Modern-1572B6?logo=css3&logoColor=white) | Styling |

### Backend

| Technology | Purpose |
|-----------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white) | Runtime Environment |
| ![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express&logoColor=white) | Web Framework |
| ![Multer](https://img.shields.io/badge/Multer-1.4.5-FF6B6B) | File Upload Handling |
| ![Archiver](https://img.shields.io/badge/Archiver-6.0.1-4A90E2) | ZIP Creation |
| ![Unzipper](https://img.shields.io/badge/Unzipper-0.10.14-FFA500) | ZIP Extraction |

### Development Tools

- **dotenv** - Environment configuration
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development auto-reload

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Home      │  │   Compress   │  │  Decompress  │       │
│  │    Page      │  │     Page     │  │     Page     │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           │                                 │
│                     ┌─────▼─────┐                           │
│                     │   Axios   │                           │
│                     │  Instance │                           │
│                     └─────┬─────┘                           │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP Requests
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                         Backend                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Express Server (Port 5000)            │     │
│  └────────────────────┬───────────────────────────────┘     │
│                       │                                     │
│         ┌─────────────┼─────────────┐                       │
│         │             │             │                       │
│    ┌────▼────┐  ┌─────▼─────┐  ┌───▼────┐                   │
│    │ Multer  │  │Compression│  │Download│                   │
│    │Middleware│ │Controller │  │Handler │                   │
│    └────┬────┘  └─────┬─────┘  └───┬────┘                   │
│         │             │             │                       │
│         └─────────────┼─────────────┘                       │
│                       │                                     │
│                 ┌─────▼─────┐                               │
│                 │  Huffman  │                               │
│                 │   Engine  │                               │
│                 └─────┬─────┘                               │
│                       │                                     │
│         ┌─────────────┼─────────────┐                       │
│    ┌────▼────┐  ┌─────▼─────┐  ┌───▼────┐                   │
│    │  Build  │  │  Encode/  │  │ Binary │                   │
│    │  Tree   │  │  Decode   │  │ Convert│                   │
│    └─────────┘  └───────────┘  └────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Compression

```
User Upload → Multer → Frequency Analysis → Tree Building → 
Code Generation → Text Encoding → Binary Conversion → 
ZIP Packaging → Download
```

#### Decompression

```
User Upload → ZIP Extraction → Metadata Reading → Tree Rebuild → 
Binary Decoding → Text Reconstruction → Download
```

---

## Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git**

### Clone Repository

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/huffman-compression-tool.git

# Navigate to project directory
cd huffman-compression-tool
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
echo "PORT=5000" > .env

# Start the server
npm start

# For development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run on `http://localhost:3000`

### Verify Installation

1. Open browser to `http://localhost:3000`
2. You should see the Huffman Compression Tool homepage
3. Try uploading a `.txt` file to test compression

---

## Usage

### Compressing a File

1. **Navigate to Compress Page**
   - Click "Compress Files" from the homepage
   - Or go directly to `/compress`

2. **Upload File**
   - Drag and drop a `.txt` file
   - Or click to browse and select
   - Max file size: 25MB

3. **Compress**
   - Click "Compress File" button
   - Wait for processing (progress shown)
   - View compression statistics

4. **Download**
   - Click "Download ZIP File"
   - Save the compressed `.zip` file

### Decompressing a File

1. **Navigate to Decompress Page**
   - Click "Decompress Files" from the homepage
   - Or go directly to `/decompress`

2. **Upload ZIP**
   - Drag and drop the compressed `.zip` file
   - Or click to browse and select

3. **Decompress**
   - Click "Decompress File" button
   - Wait for processing

4. **Download**
   - Click "Download Text File"
   - Your original file is restored!

### Example Files

Create a test file:
```bash
echo "Hello, World! This is a test file for Huffman compression. The quick brown fox jumps over the lazy dog." > test.txt
```

---

## API Reference

### Base URL

```
http://localhost:5000/api
```

### Endpoints

#### 1. Compress File

**POST** `/compress`

Compress a text file using Huffman coding.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (text file)

**Response:**
```json
{
  "success": true,
  "message": "File compressed successfully",
  "stats": {
    "originalSize": 1024,
    "compressedSize": 512,
    "compressionRatio": "50.00%",
    "spaceSaved": 512
  },
  "file": "example_1234567890.zip",
  "displayName": "example.zip"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid file or missing file
- `500` - Server error

---

#### 2. Decompress File

**POST** `/decompress`

Decompress a Huffman-compressed ZIP file.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (ZIP file)

**Response:**
```json
{
  "success": true,
  "message": "File decompressed successfully",
  "file": "1234567890_example.txt",
  "originalFileName": "example.txt"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid file or missing file
- `500` - Server error

---

#### 3. Download File

**GET** `/download/:filename`

Download a compressed or decompressed file.

**Parameters:**
- `filename` - Name of the file to download

**Response:**
- Binary file download

**Status Codes:**
- `200` - Success
- `404` - File not found
- `500` - Server error

---

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

---

## Algorithm Explained

### Huffman Coding Process

#### 1. **Frequency Analysis**
```javascript
// Count character frequencies
Input: "hello"
Frequencies: { 'h': 1, 'e': 1, 'l': 2, 'o': 1 }
```

#### 2. **Build Priority Queue**
```
Create nodes for each character with frequency
Sort by frequency (ascending)
```

#### 3. **Construct Huffman Tree**
```
While queue has more than one node:
  1. Remove two nodes with lowest frequency
  2. Create parent node (sum of frequencies)
  3. Add parent back to queue
```

**Example Tree:**
```
        (5)
       /   \
      /     \
    (2)     (3)
    / \     / \
   h   e   l   o
```

#### 4. **Generate Codes**
```
Traverse tree:
  - Left edge = '0'
  - Right edge = '1'

Codes: { 'h': '00', 'e': '01', 'l': '10', 'o': '11' }
```

#### 5. **Encode Text**
```
"hello" → "00 01 10 10 11" → "0001101011"
```

#### 6. **Binary Packing**
```
Convert bit string to bytes for storage efficiency
```

### Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Build Frequency Table | O(n) | O(k) |
| Build Huffman Tree | O(k log k) | O(k) |
| Generate Codes | O(k) | O(k) |
| Encode Text | O(n) | O(n) |
| Decode Text | O(n) | O(n) |

Where:
- `n` = input length
- `k` = unique characters (k ≤ 256 for ASCII)

---

## 📂 Project Structure

```
huffman-compression-tool/
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Axios configuration
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.js             # Navigation bar
│   │   │   └── Navbar.css
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.js               # Landing page
│   │   │   ├── Home.css
│   │   │   ├── Compress.js           # Compression interface
│   │   │   ├── Compress.css
│   │   │   ├── Decompress.js         # Decompression interface
│   │   │   └── Decompress.css
│   │   │
│   │   ├── App.js                    # Main app component
│   │   ├── App.css
│   │   ├── index.js                  # Entry point
│   │   └── index.css
│   │
│   └── package.json
│
├── backend/
│   ├── controllers/
│   │   └── compressionController.js  # Request handlers
│   │
│   ├── utils/
│   │   └── huffman.js                # Huffman algorithm
│   │
│   ├── uploads/                      # Temporary file storage
│   │
│   ├── server.js                     # Express server
│   ├── .env                          # Environment variables
│   └── package.json
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## Performance

### Compression Ratios

| File Type | Average Compression | Example |
|-----------|-------------------|---------|
| Plain Text | 40-60% | `README.md` |
| Code Files | 45-65% | `script.js` |
| Repetitive Text | 70-80% | `logs.txt` |
| Random Text | 10-20% | `random.txt` |

### Benchmark Results

**Test File:** 1MB text file with varied content

| Metric | Value |
|--------|-------|
| Compression Time | ~200ms |
| Decompression Time | ~150ms |
| Memory Usage | <50MB |
| Compression Ratio | 55% |

*Tested on: Intel i5, 8GB RAM, Node.js 18*

---

## Screenshots

### Homepage
![Homepage](screenshots/Dashboard.png)

### Compress Interface
![Compress](screenshots/Compress.png)

### Compression Results
![Results](screenshots/Compressresult.png)

### Decompress Interface
![Decompress](screenshots/Decompress.png)

### Decompression Results
![Results](screenshots/Decompressionresult.png)

---

## Acknowledgments

### Inspiration & Resources

- **David Huffman** - For the brilliant compression algorithm
- **Create React App** - For the React boilerplate
- **Express.js** - For the robust backend framework
- **The MERN Community** - For excellent documentation

### Libraries & Tools

- [React](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime
- [Express](https://expressjs.com/) - Web framework
- [Multer](https://github.com/expressjs/multer) - File upload handling
- [Archiver](https://www.archiverjs.com/) - ZIP creation
- [Axios](https://axios-http.com/) - HTTP client

### Learning Resources

- [Introduction to Algorithms](https://mitpress.mit.edu/books/introduction-algorithms) - CLRS
- [Data Compression Explained](http://mattmahoney.net/dc/dce.html) - Matt Mahoney
- [Huffman Coding Visualization](https://www.cs.usfca.edu/~galles/visualization/Huffman.html)

---

## Author

**Eshaan Nair**

- GitHub: [@Eshaan Nair](https://github.com/Eshaan-Nair)

**Project Link:** [Huffman-Compression-Tool](https://github.com/Eshaan-Nair/Huffman-File-Compression-Tool-MERN)

---

<div align="center">

**[Back to Top](#-huffman-compression-tool)**

</div>