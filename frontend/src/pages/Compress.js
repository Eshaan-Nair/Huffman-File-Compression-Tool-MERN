import React, { useState } from 'react';
import axios from '../api/axios';
import './Compress.css';

const Compress = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return 'No file selected';
    }

    const allowedTypes = ['text/plain', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      return 'Only .txt and .pdf files are allowed';
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return `File size exceeds 25MB limit. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`;
    }

    return null;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    const validationError = validateFile(selectedFile);
    
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleCompress = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/compress', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });
      setResult(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Compression failed');
      setLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(`/download/${filename}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Download failed');
    }
  };

  const formatBytes = (bytes) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  const getFileIcon = () => {
    if (!file) return '📄';
    return file.type === 'application/pdf' ? '📕' : '📄';
  };

  return (
    <div className="compress-container">
      <h1 className="page-title">Compress File</h1>
      
      <div className="upload-section">
        <div 
          className={`file-drop-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-input"
            onChange={handleFileChange}
            accept=".txt,.pdf"
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            <div className="upload-icon">📁</div>
            <p className="upload-text">
              {file ? (
                <>
                  <span className="file-icon">{getFileIcon()}</span>
                  <span className="file-name">{file.name}</span>
                </>
              ) : (
                <>
                  <strong>Drop your file here</strong> or <span className="browse-link">browse</span>
                </>
              )}
            </p>
            <p className="upload-hint">Supports: .txt and .pdf files (Max 25MB)</p>
          </label>
        </div>

        {file && (
          <div className="file-info">
            <div className="file-info-item">
              <span className="info-label">File:</span>
              <span className="info-value">{file.name}</span>
            </div>
            <div className="file-info-item">
              <span className="info-label">Type:</span>
              <span className="info-value">{file.type === 'application/pdf' ? 'PDF' : 'Text'}</span>
            </div>
            <div className="file-info-item">
              <span className="info-label">Size:</span>
              <span className="info-value">{formatBytes(file.size)}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleCompress}
          disabled={!file || loading}
          className="compress-btn-action"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Compressing...
            </>
          ) : (
            'Compress File'
          )}
        </button>

        {error && <div className="error-message">❌ {error}</div>}
      </div>

      {result && (
        <div className="result-section">
          <h2>✅ Compression Complete!</h2>
          
          <div className="file-type-badge">
            File Type: {result.fileType}
          </div>

          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">Original Size:</span>
              <span className="stat-value">{formatBytes(result.stats.originalSize)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Compressed Size:</span>
              <span className="stat-value">{formatBytes(result.stats.compressedSize)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Compression Ratio:</span>
              <span className="stat-value">{result.stats.compressionRatio}</span>
            </div>
            <div className="stat-item highlight">
              <span className="stat-label">💾 Space Saved:</span>
              <span className="stat-value">{formatBytes(result.stats.spaceSaved)}</span>
            </div>
          </div>

          <div className="download-buttons">
            <button
              onClick={() => handleDownload(result.files.compressedFile)}
              className="download-btn"
            >
              📥 Download Compressed File
            </button>
            <button
              onClick={() => handleDownload(result.files.codesFile)}
              className="download-btn secondary"
            >
              📋 Download Codes File
            </button>
          </div>

          <div className="warning-note">
            <strong>⚠️ Important:</strong> Save both files! You'll need them for decompression.
          </div>
        </div>
      )}
    </div>
  );
};

export default Compress;