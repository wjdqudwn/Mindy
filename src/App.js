// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import ImagePage from './Image'; // 기존 Image.js 경로


function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/image">Image</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/image" element={<ImagePage />} />
      </Routes>
    </Router>
  );
}

export default App;
