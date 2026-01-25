import React, { useState } from 'react';
import axios from '../api/axios';
import './Decompress.css';

const Decompress = () => {
  const [compressedFile, setCompressedFile] = useState(null);
  const [codesFile, setCodesFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActiveCompressed, setDragActiveCompressed] = useState(false);
  const [dragActiveCodes, setDragActiveCodes] = useState(false);

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  const validateFile = (file, expectedExtension) => {
    if (!file) return 'No file selected';
    
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 25MB limit`;
    }

    const fileName = file.name.toLowerCase();
    if (expectedExtension === '.bin' && !fileName.endsWith('.bin')) {
      return 'Please select a .bin file';
    }
    if (expectedExtension === '.json' && !fileName.endsWith('.json')) {
      return 'Please select a .json file';
    }

    return null;
  };

  const handleCompressedFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processCompressedFile(selectedFile);
  };

  const handleCodesFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processCodesFile(selectedFile);
  };

  const processCompressedFile = (file) => {
    const validationError = validateFile(file, '.bin');
    if (validationError) {
      setError(validationError);
      return;
    }
    setCompressedFile(file);
    setError(null);
    setResult(null);
  };

  const processCodesFile = (file) => {
    const validationError = validateFile(file, '.json');
    if (validationError) {
      setError(validationError);
      return;
    }
    setCodesFile(file);
    setError(null);
    setResult(null);
  };

  // Drag handlers for compressed file
  const handleDragCompressed = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveCompressed(true);
    } else if (e.type === "dragleave") {
      setDragActiveCompressed(false);
    }
  };

  const handleDropCompressed = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveCompressed(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCompressedFile(e.dataTransfer.files[0]);
    }
  };

  // Drag handlers for codes file
  const handleDragCodes = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveCodes(true);
    } else if (e.type === "dragleave") {
      setDragActiveCodes(false);
    }
  };

  const handleDropCodes = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveCodes(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCodesFile(e.dataTransfer.files[0]);
    }
  };

  const handleDecompress = async () => {
    if (!compressedFile || !codesFile) {
      setError('Please select both files');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('compressedFile', compressedFile);
    formData.append('codesFile', codesFile);

    try {
      const response = await axios.post('/decompress', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Decompression failed');
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

  return (
    <div className="decompress-container">
      <h1 className="page-title">Decompress File</h1>
      
      <div className="upload-section">
        <div className="file-upload-group">
          <h3>1️⃣ Compressed File (.bin)</h3>
          <div 
            className={`file-drop-zone ${dragActiveCompressed ? 'drag-active' : ''}`}
            onDragEnter={handleDragCompressed}
            onDragLeave={handleDragCompressed}
            onDragOver={handleDragCompressed}
            onDrop={handleDropCompressed}
          >
            <input
              type="file"
              id="compressed-input"
              onChange={handleCompressedFileChange}
              accept=".bin"
              className="file-input"
            />
            <label htmlFor="compressed-input" className="file-label">
              <div className="upload-icon">📦</div>
              <p className="upload-text">
                {compressedFile ? (
                  <>
                    <span className="file-icon">✓</span>
                    <span className="file-name">{compressedFile.name}</span>
                  </>
                ) : (
                  <>Drop compressed file or <span className="browse-link">browse</span></>
                )}
              </p>
            </label>
          </div>
        </div>

        <div className="file-upload-group">
          <h3>2️⃣ Codes File (.json)</h3>
          <div 
            className={`file-drop-zone ${dragActiveCodes ? 'drag-active' : ''}`}
            onDragEnter={handleDragCodes}
            onDragLeave={handleDragCodes}
            onDragOver={handleDragCodes}
            onDrop={handleDropCodes}
          >
            <input
              type="file"
              id="codes-input"
              onChange={handleCodesFileChange}
              accept=".json"
              className="file-input"
            />
            <label htmlFor="codes-input" className="file-label">
              <div className="upload-icon">📋</div>
              <p className="upload-text">
                {codesFile ? (
                  <>
                    <span className="file-icon">✓</span>
                    <span className="file-name">{codesFile.name}</span>
                  </>
                ) : (
                  <>Drop codes file or <span className="browse-link">browse</span></>
                )}
              </p>
            </label>
          </div>
        </div>

        {(compressedFile || codesFile) && (
          <div className="files-info">
            {compressedFile && (
              <div className="file-info-item">
                <span className="info-icon">✅</span>
                <span>Compressed file: <strong>{compressedFile.name}</strong> ({formatBytes(compressedFile.size)})</span>
              </div>
            )}
            {codesFile && (
              <div className="file-info-item">
                <span className="info-icon">✅</span>
                <span>Codes file: <strong>{codesFile.name}</strong> ({formatBytes(codesFile.size)})</span>
              </div>
            )}
            {compressedFile && !codesFile && (
              <div className="file-info-item warning">
                <span className="info-icon">⚠️</span>
                <span>Still need codes file to decompress</span>
              </div>
            )}
            {!compressedFile && codesFile && (
              <div className="file-info-item warning">
                <span className="info-icon">⚠️</span>
                <span>Still need compressed file to decompress</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleDecompress}
          disabled={!compressedFile || !codesFile || loading}
          className="decompress-btn-action"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Decompressing...
            </>
          ) : (
            'Decompress Files'
          )}
        </button>

        {error && <div className="error-message">❌ {error}</div>}
      </div>

      {result && (
        <div className="result-section">
          <h2>✅ Decompression Complete!</h2>
          
          <div className="file-type-badge">
            File Type: {result.fileType}
          </div>

          <div className="success-info">
            <div className="info-row">
              <span className="info-label">Original File Name:</span>
              <span className="info-value">{result.originalFileName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Decompressed File:</span>
              <span className="info-value">{result.file}</span>
            </div>
          </div>

          <button
            onClick={() => handleDownload(result.file)}
            className="download-btn"
          >
            📥 Download Decompressed File
          </button>
        </div>
      )}
    </div>
  );
};

export default Decompress;