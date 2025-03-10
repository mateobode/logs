import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Clear any stored location in history if you're using browser storage
// This helps ensure the app always starts on the Dashboard page
if (window.history && window.history.pushState) {
  // Force navigation to root path on initial load
  window.history.pushState({}, '', '/');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);