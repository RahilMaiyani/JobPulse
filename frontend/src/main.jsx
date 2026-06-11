import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error handlers to intercept dynamic import failures (e.g. from new deployments)
// and trigger a page reload to fetch the latest index.html and asset chunk map.
window.addEventListener('error', (e) => {
  const isChunkError = 
    e.message && 
    (e.message.includes('Failed to fetch dynamically imported module') || 
     e.message.includes('Importing a module script failed') ||
     e.message.includes('error loading dynamically imported module'));
  if (isChunkError) {
    const lastReload = sessionStorage.getItem('last-chunk-reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload) > 10000) {
      sessionStorage.setItem('last-chunk-reload', now.toString());
      window.location.reload();
    }
  }
}, true);

window.addEventListener('unhandledrejection', (e) => {
  const errorText = e.reason?.message || '';
  const isChunkError = 
    errorText.includes('Failed to fetch dynamically imported module') || 
    errorText.includes('Importing a module script failed') ||
    errorText.includes('error loading dynamically imported module');
  if (isChunkError) {
    const lastReload = sessionStorage.getItem('last-chunk-reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload) > 10000) {
      sessionStorage.setItem('last-chunk-reload', now.toString());
      window.location.reload();
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
