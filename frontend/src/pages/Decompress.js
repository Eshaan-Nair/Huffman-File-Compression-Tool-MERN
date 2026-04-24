import React, { useState, useRef } from 'react';
import axios from '../api/axios';
import './Decompress.css';

const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const IconArchive = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"></polyline>
    <rect x="1" y="3" width="22" height="5"></rect>
    <line x1="10" y1="12" x2="14" y2="12"></line>
  </svg>
);

const IconDownload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

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
    <div className="app-page">
      <div className="page-header">
        <h1 className="page-title">Decompress File</h1>
        <p className="page-subtitle">Select a ZIP archive to restore the original text file.</p>
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
            accept=".zip"
            className="file-input-hidden"
          />
          
          {!file ? (
            <div className="drop-content">
              <div className="icon-circle">
                <IconUpload />
              </div>
              <p className="drop-title">Click to upload or drag and drop</p>
              <p className="drop-desc">ZIP up to 25MB</p>
            </div>
          ) : (
            <div className="file-info">
              <div className="file-info-left">
                <IconArchive />
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
            onClick={handleDecompress}
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading ? `Decompressing... ${progress}%` : 'Decompress File'}
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
            <h3>Decompression Complete</h3>
          </div>
          
          <div className="data-list">
            <div className="data-row">
              <span className="data-label">Original File</span>
              <span className="data-value">{result.originalFileName}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Decompressed File</span>
              <span className="data-value">{result.file}</span>
            </div>
          </div>

          <button
            onClick={() => handleDownload(result.file)}
            className="btn btn-primary btn-block"
          >
            <IconDownload />
            Download Text File
          </button>
        </div>
      )}
    </div>
  );
};

export default Decompress;