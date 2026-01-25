import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Huffman Compressor
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/compress" className="nav-link">
              Compress
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/decompress" className="nav-link">
              Decompress
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;