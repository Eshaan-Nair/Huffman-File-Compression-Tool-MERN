import React, { useState } from 'react';
import axios from '../api/axios';
import './Compress.css';

const Compress = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return 'No file selected';
    }

    if (selectedFile.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
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

  const processFile = async (selectedFile) => {
    const validationError = validateFile(selectedFile);
    
    if (validationError) {
      setError(validationError);
      setFile(null);
      setFilePreview(null);
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError(null);

    // Create file preview
    const preview = {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      lastModified: new Date(selectedFile.lastModified).toLocaleString()
    };
    setFilePreview(preview);
  };

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
      setError('Please select a PDF file first');
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
        }
      });
      
      // Store result with base64 data
      setResult({
        ...response.data,
        downloadReady: true
      });
      setLoading(false);
    } catch (err) {
      console.error('Compression error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Compression failed');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    try {
      if (!result || !result.zipData) {
        setError('No compressed data available');
        return;
      }

      // Convert base64 to blob
      const byteCharacters = atob(result.zipData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/zip' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', result.fileName || 'compressed.zip');
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Download failed: ' + err.message);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionPercentage = () => {
    if (!result) return 0;
    return 100 - parseFloat(result.stats.compressionRatio);
  };

  return (
    <div className="compress-container">
      <h1 className="page-title">🗜️ Compress PDF</h1>
      
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
            accept=".pdf,application/pdf"
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            <div className="upload-icon">📕</div>
            <p className="upload-text">
              {file ? (
                <>
                  <span className="file-icon">✓</span>
                  <span className="file-name">{file.name}</span>
                </>
              ) : (
                <>
                  <strong>Drop your PDF here</strong> or <span className="browse-link">browse</span>
                </>
              )}
            </p>
            <p className="upload-hint">Only PDF files (Max 25MB)</p>
          </label>
        </div>

        {filePreview && (
          <div className="file-preview">
            <h3 className="preview-title">📄 File Preview</h3>
            <div className="preview-grid">
              <div className="preview-item">
                <span className="preview-label">Filename:</span>
                <span className="preview-value">{filePreview.name}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Size:</span>
                <span className="preview-value">{formatBytes(filePreview.size)}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Type:</span>
                <span className="preview-value">PDF Document</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Modified:</span>
                <span className="preview-value">{filePreview.lastModified}</span>
              </div>
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
              Compressing PDF...
            </>
          ) : (
            '🗜️ Compress PDF'
          )}
        </button>

        {error && <div className="error-message">❌ {error}</div>}
      </div>

      {result && (
        <div className="result-section">
          <h2>✅ Compression Complete!</h2>
          
          <div className="compression-visual">
            <div className="size-comparison">
              <div className="size-bar original-bar">
                <div className="bar-label">Original Size</div>
                <div className="bar-container">
                  <div className="bar-fill original-fill" style={{width: '100%'}}>
                    {formatBytes(result.stats.originalSize)}
                  </div>
                </div>
              </div>
              <div className="size-bar compressed-bar">
                <div className="bar-label">Compressed Size</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill compressed-fill" 
                    style={{width: result.stats.compressionRatio}}
                  >
                    {formatBytes(result.stats.compressedSize)}
                  </div>
                </div>
              </div>
            </div>

            <div className="savings-badge">
              <div className="savings-percentage">{getCompressionPercentage().toFixed(0)}%</div>
              <div className="savings-label">Space Saved</div>
              <div className="savings-amount">{formatBytes(result.stats.spaceSaved)}</div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-label">Original</div>
                <div className="stat-value">{formatBytes(result.stats.originalSize)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <div className="stat-label">Compressed</div>
                <div className="stat-value">{formatBytes(result.stats.compressedSize)}</div>
              </div>
            </div>
            <div className="stat-card highlight">
              <div className="stat-icon">💾</div>
              <div className="stat-info">
                <div className="stat-label">Saved</div>
                <div className="stat-value">{formatBytes(result.stats.spaceSaved)}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="download-btn"
          >
            📥 Download Compressed ZIP
          </button>

          <div className="info-note">
            <strong>ℹ️ Note:</strong> The ZIP file contains everything needed for decompression. Just upload this single file when you want to decompress!
          </div>
        </div>
      )}
    </div>
  );
};

export default Compress;