import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fontsource/ibm-plex-sans'; // Loads all weights/styles by default

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
