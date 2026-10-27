import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './services/theme'; // apply the saved light/dark theme before first paint
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
