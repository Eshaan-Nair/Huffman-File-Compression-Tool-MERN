import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Compress from './pages/Compress';
import Decompress from './pages/Decompress';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compress" element={<Compress />} />
          <Route path="/decompress" element={<Decompress />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;