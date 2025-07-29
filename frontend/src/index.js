import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
// import AdminPanel from './AdminPanel'; // This line is removed as AdminPanel is integrated into App.js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* The AdminPanel route is removed as its functionality is now managed within App.js */}
        {/* <Route path="/admin/*" element={<AdminPanel />} /> */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);