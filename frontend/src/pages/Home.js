import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const IconLightning = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const IconSave = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <span className="hero-badge">Huffman Coding Algorithm</span>
        <h1 className="home-title">
          Efficient file compression.
        </h1>
        <p className="home-subtitle">
          Compress your text files efficiently using a minimal, high-performance algorithm. 
          Save space securely without losing data.
        </p>
        
        <div className="home-buttons">
          <Link to="/compress" className="btn btn-primary">
            Compress Files
          </Link>
          <Link to="/decompress" className="btn btn-secondary">
            Decompress Files
          </Link>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <IconLightning />
          </div>
          <h3>Lightning Fast</h3>
          <p>Optimized Huffman encoding algorithm processes files in milliseconds.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <IconSave />
          </div>
          <h3>Maximum Savings</h3>
          <p>Reduce file sizes significantly, saving valuable storage space.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <IconLock />
          </div>
          <h3>100% Lossless</h3>
          <p>Perfect restoration of original data without any quality degradation.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;