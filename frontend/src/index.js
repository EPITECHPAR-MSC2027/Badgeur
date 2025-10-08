import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import './style/theme.css'
import ParamTre from './pages/Paramètre'
import './style/Test.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ParamTre />
  </React.StrictMode>
);
