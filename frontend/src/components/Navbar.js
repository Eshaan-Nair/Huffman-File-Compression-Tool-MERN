import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

// Simple SVG Icons
const IconCompress = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
    <path d="M12 12v9"></path>
    <path d="m8 17 4 4 4-4"></path>
  </svg>
);

const IconDecompress = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
    <path d="M12 12v9"></path>
    <path d="m16 16-4-4-4 4"></path>
  </svg>
);

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-box"></div>
          <span className="logo-text">Huffman Tool</span>
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/compress" 
              className={`nav-link ${location.pathname === '/compress' ? 'active' : ''}`}
            >
              <IconCompress />
              Compress
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/decompress" 
              className={`nav-link ${location.pathname === '/decompress' ? 'active' : ''}`}
            >
              <IconDecompress />
              Decompress
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;