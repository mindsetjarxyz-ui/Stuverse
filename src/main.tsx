// Fix for "Cannot set property fetch of #<Window> which has only a getter"
// This happens in some iframe environments where window.fetch is read-only.
// We must do this BEFORE any other imports to ensure it's patched before dependencies run.
try {
  const originalFetch = window.fetch;
  if (originalFetch) {
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get: () => originalFetch,
      set: () => {
        // Silently ignore attempts to overwrite fetch in read-only environments
      }
    });
  }
} catch (e) {
  // Silently ignore patching errors as we can't do much if it's non-configurable
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
