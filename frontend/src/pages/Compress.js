import React, { useState, useRef } from 'react';
import axios from '../api/axios';
import './Compress.css';

const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const IconFile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const IconDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

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
    <div className="app-page">
      <div className="page-header">
        <h1 className="page-title">Compress File</h1>
        <p className="page-subtitle">Select a text file to compress into a ZIP archive.</p>
      </div>
      
      <div className="panel">
        <div 
          className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
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
            className="file-input-hidden"
          />
          
          {!file ? (
            <div className="drop-content">
              <div className="icon-circle">
                <IconUpload />
              </div>
              <p className="drop-title">Click to upload or drag and drop</p>
              <p className="drop-desc">TXT up to 25MB</p>
            </div>
          ) : (
            <div className="file-info">
              <div className="file-info-left">
                <IconFile />
                <div className="file-meta">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatBytes(file.size)}</span>
                </div>
              </div>
              <button 
                className="btn-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {file && !result && (
          <button
            onClick={handleCompress}
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading ? `Compressing... ${progress}%` : 'Compress File'}
          </button>
        )}

        {loading && (
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>

      {result && (
        <div className="panel result-panel">
          <div className="result-header">
            <h3>Compression Complete</h3>
          </div>
          
          <div className="data-grid">
            <div className="data-item">
              <span className="data-label">Original</span>
              <span className="data-value">{formatBytes(result.stats.originalSize)}</span>
            </div>
            <div className="data-item">
              <span className="data-label">Compressed</span>
              <span className="data-value">{formatBytes(result.stats.compressedSize)}</span>
            </div>
            <div className="data-item">
              <span className="data-label">Ratio</span>
              <span className="data-value">{result.stats.compressionRatio}</span>
            </div>
            <div className="data-item highlight">
              <span className="data-label">Saved</span>
              <span className="data-value success">{formatBytes(result.stats.spaceSaved)}</span>
            </div>
          </div>

          <button
            onClick={() => handleDownload(result.file)}
            className="btn btn-primary btn-block"
          >
            <IconDownload />
            Download Archive
          </button>
        </div>
      )}
    </div>
  );
};

export default Compress;