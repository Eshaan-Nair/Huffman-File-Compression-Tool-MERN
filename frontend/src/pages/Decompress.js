import React, { useState, useRef } from 'react';
import axios from '../api/axios';
import './Decompress.css';

const Decompress = () => {
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
    
    const fileName = selectedFile.name.toLowerCase();
    
    if (!fileName.endsWith('.zip')) {
      return 'Only .zip files are allowed';
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

  const handleDecompress = async () => {
    if (!file) {
      setError('Please select a ZIP file');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/decompress', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      setResult(response.data);
      setLoading(false);
      setProgress(100);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Decompression failed');
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(`/download/${filename}`, {
        responseType: 'blob'
      });
      
      // Extract original name without timestamp
      const downloadName = result.originalFileName || filename.replace(/^\d+_/, '');
      
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
    <div className="decompress-container">
      <h1 className="page-title">
        <span className="icon">📦</span>
        Decompress File
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
            accept=".zip"
            className="file-input"
          />
          
          {!file ? (
            <div className="drop-zone-content">
              <div className="upload-icon">📦</div>
              <p className="drop-text">
                {isDragging ? 'Drop your ZIP file here' : 'Drag & drop your .zip file here'}
              </p>
              <p className="drop-subtext">or click to browse</p>
              <div className="file-requirements">
                <span className="requirement-badge">🗜️ .zip files only</span>
                <span className="requirement-badge">📊 Max 25MB</span>
              </div>
            </div>
          ) : (
            <div className="file-preview">
              <div className="file-icon">🗜️</div>
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
            onClick={handleDecompress}
            disabled={loading}
            className="decompress-btn-action"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Decompressing... {progress}%
              </>
            ) : (
              <>
                <span>📂</span>
                Decompress File
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
            <h2>Decompression Complete!</h2>
          </div>
          
          <div className="success-info">
            <div className="info-item">
              <span className="info-icon">📄</span>
              <div className="info-content">
                <span className="info-label">Original File Name</span>
                <span className="info-value">{result.originalFileName}</span>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📁</span>
              <div className="info-content">
                <span className="info-label">Decompressed File</span>
                <span className="info-value">{result.file}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleDownload(result.file)}
            className="download-btn"
          >
            <span>📥</span>
            Download Text File
          </button>

          <p className="note">
            ✨ Your file has been successfully restored!
          </p>
        </div>
      )}
    </div>
  );
};

export default Decompress;