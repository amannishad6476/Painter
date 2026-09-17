import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Immediate startup purge of obsolete legacy gallery storage key
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('munnalal_gallery');
  }
} catch (e) {
  // Storage access error safely ignored
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
