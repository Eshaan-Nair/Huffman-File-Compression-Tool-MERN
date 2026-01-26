import React, { useState } from 'react';
import axios from '../api/axios';
import './Decompress.css';

const Decompress = () => {
  const [zipFile, setZipFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  const validateFile = (file) => {
    if (!file) return 'No file selected';
    
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 25MB limit`;
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.zip')) {
      return 'Please select a ZIP file';
    }

    return null;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setZipFile(null);
      return;
    }
    setZipFile(file);
    setError(null);
    setResult(null);
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

  const handleDecompress = async () => {
    if (!zipFile) {
      setError('Please select a ZIP file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', zipFile);

    try {
      const response = await axios.post('/decompress', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult({
        ...response.data,
        downloadReady: true
      });
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Decompression failed');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(result.pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', result.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Download failed');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="decompress-container">
      <h1 className="page-title">📂 Decompress PDF</h1>
      
      <div className="upload-section">
        <div className="file-upload-group">
          <h3>📦 Upload Compressed ZIP File</h3>
          <div 
            className={`file-drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="zip-input"
              onChange={handleFileChange}
              accept=".zip,application/zip,application/x-zip-compressed"
              className="file-input"
            />
            <label htmlFor="zip-input" className="file-label">
              <div className="upload-icon">📦</div>
              <p className="upload-text">
                {zipFile ? (
                  <>
                    <span className="file-icon">✓</span>
                    <span className="file-name">{zipFile.name}</span>
                  </>
                ) : (
                  <>Drop your ZIP file here or <span className="browse-link">browse</span></>
                )}
              </p>
              <p className="upload-hint">Only ZIP files from compression (Max 25MB)</p>
            </label>
          </div>
        </div>

        {zipFile && (
          <div className="files-info">
            <div className="file-info-item">
              <span className="info-icon">✅</span>
              <span>ZIP file: <strong>{zipFile.name}</strong> ({formatBytes(zipFile.size)})</span>
            </div>
          </div>
        )}

        <button
          onClick={handleDecompress}
          disabled={!zipFile || loading}
          className="decompress-btn-action"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Decompressing...
            </>
          ) : (
            '📂 Decompress to PDF'
          )}
        </button>

        {error && <div className="error-message">❌ {error}</div>}
      </div>

      {result && (
        <div className="result-section">
          <h2>✅ Decompression Complete!</h2>
          
          <div className="success-animation">
            <div className="checkmark-circle">
              <div className="checkmark">✓</div>
            </div>
          </div>

          <div className="success-info">
            <div className="info-row">
              <span className="info-label">📄 Original PDF Name:</span>
              <span className="info-value">{result.originalFileName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">📕 Decompressed File:</span>
              <span className="info-value">{result.file}</span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="download-btn"
          >
            📥 Download Decompressed PDF
          </button>

          <div className="info-note">
            <strong>✨ Success!</strong> Your PDF has been restored to its original form.
          </div>
        </div>
      )}
    </div>
  );
};

export default Decompress;