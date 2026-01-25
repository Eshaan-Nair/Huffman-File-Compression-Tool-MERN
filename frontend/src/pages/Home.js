import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Compression Tool</h1>
      <p className="home-subtitle">
        Compress and decompress files using Huffman Coding Algorithm
      </p>
      <div className="home-buttons">
        <Link to="/compress" className="home-btn compress-btn">
          Compress Files
        </Link>
        <Link to="/decompress" className="home-btn decompress-btn">
          Decompress Files
        </Link>
      </div>
    </div>
  );
};

export default Home;