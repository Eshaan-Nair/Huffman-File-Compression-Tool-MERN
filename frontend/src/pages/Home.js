import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-icon">🗜️</div>
        <h1 className="home-title">Huffman Compression Tool</h1>
        <p className="home-subtitle">
          Compress your text files efficiently using the Huffman Coding Algorithm
        </p>
        <p className="home-description">
          Upload a .txt file to compress it into a .zip archive, or upload a .zip file to restore the original text
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Fast Compression</h3>
          <p>Lightning-fast Huffman encoding algorithm</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💾</div>
          <h3>Space Saving</h3>
          <p>Reduce file sizes significantly</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Lossless</h3>
          <p>Perfect restoration of original data</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>Easy to Use</h3>
          <p>Simple drag & drop interface</p>
        </div>
      </div>

      <div className="home-buttons">
        <Link to="/compress" className="home-btn compress-btn">
          <span className="btn-icon">🗜️</span>
          <span className="btn-content">
            <span className="btn-title">Compress Files</span>
            <span className="btn-desc">.txt → .zip</span>
          </span>
        </Link>
        <Link to="/decompress" className="home-btn decompress-btn">
          <span className="btn-icon">📦</span>
          <span className="btn-content">
            <span className="btn-title">Decompress Files</span>
            <span className="btn-desc">.zip → .txt</span>
          </span>
        </Link>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>📋 How It Works</h3>
          <ol>
            <li>Upload your .txt file for compression or .zip file for decompression</li>
            <li>The Huffman algorithm processes your file</li>
            <li>Download the result instantly</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Home;