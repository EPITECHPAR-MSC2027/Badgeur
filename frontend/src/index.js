import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Apply dyslexic mode from localStorage before React renders
if (localStorage.getItem('dyslexicMode') === 'true') {
  document.body.classList.add('dyslexic-mode');
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
