import React, { useState, useRef } from 'react';
import axios from '../api/axios';
import './Compress.css';

const Compress = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  const validateFile = (selectedFile) => {
    if (!selectedFile) return 'No file selected';
    
    const allowedTypes = ['.txt', '.text'];
    const fileName = selectedFile.name.toLowerCase();
    const isValidType = allowedTypes.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      return 'Only .txt files are allowed';
    }
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      return 'File size must be less than 25MB';
    }
    
    if (selectedFile.size === 0) {
      return 'File is empty';
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
      setResult(null);
      return;
    }
    
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const handleCompress = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/compress', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      setResult(response.data);
      setLoading(false);
      setProgress(100);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Compression failed');
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(`/download/${filename}`, {
        responseType: 'blob'
      });
      
      // Use the display name from result if available
      const downloadName = result.displayName || filename;
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Download failed');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 KB';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="compress-container">
      <h1 className="page-title">
        <span className="icon">🗜️</span>
        Compress File
      </h1>
      
      <div className="upload-section">
        <div 
          className={`file-drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.text"
            className="file-input"
          />
          
          {!file ? (
            <div className="drop-zone-content">
              <div className="upload-icon">📁</div>
              <p className="drop-text">
                {isDragging ? 'Drop your file here' : 'Drag & drop your .txt file here'}
              </p>
              <p className="drop-subtext">or click to browse</p>
              <div className="file-requirements">
                <span className="requirement-badge">📄 .txt files only</span>
                <span className="requirement-badge">📊 Max 25MB</span>
              </div>
            </div>
          ) : (
            <div className="file-preview">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <p className="file-name">{file.name}</p>
                <p className="file-size">{formatBytes(file.size)}</p>
              </div>
              <button 
                className="clear-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {file && !result && (
          <button
            onClick={handleCompress}
            disabled={loading}
            className="compress-btn-action"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Compressing... {progress}%
              </>
            ) : (
              <>
                <span>🗜️</span>
                Compress File
              </>
            )}
          </button>
        )}

        {loading && (
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="result-section">
          <div className="success-header">
            <span className="success-icon">✓</span>
            <h2>Compression Complete!</h2>
          </div>
          
          <div className="stats">
            <div className="stat-item">
              <span className="stat-icon">📦</span>
              <div className="stat-content">
                <span className="stat-label">Original Size</span>
                <span className="stat-value">{formatBytes(result.stats.originalSize)}</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🗜️</span>
              <div className="stat-content">
                <span className="stat-label">Compressed Size</span>
                <span className="stat-value">{formatBytes(result.stats.compressedSize)}</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📊</span>
              <div className="stat-content">
                <span className="stat-label">Compression Ratio</span>
                <span className="stat-value">{result.stats.compressionRatio}</span>
              </div>
            </div>
            <div className="stat-item highlight">
              <span className="stat-icon">💾</span>
              <div className="stat-content">
                <span className="stat-label">Space Saved</span>
                <span className="stat-value success">{formatBytes(result.stats.spaceSaved)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleDownload(result.file)}
            className="download-btn"
          >
            <span>📥</span>
            Download ZIP File
          </button>

          <p className="note">
            💡 Save this ZIP file to decompress later!
          </p>
        </div>
      )}
    </div>
  );
};

export default Compress;