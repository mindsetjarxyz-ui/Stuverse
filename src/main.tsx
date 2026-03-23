import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Fix for "Cannot set property fetch of #<Window> which has only a getter"
// This happens in some iframe environments where window.fetch is read-only.
// We try multiple ways to make it writable or at least provide a setter that does nothing.
(function patchFetch() {
  const patch = (obj: any) => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, 'fetch');
    if (descriptor && !descriptor.configurable) {
      return false;
    }
    const originalFetch = obj.fetch;
    try {
      Object.defineProperty(obj, 'fetch', {
        configurable: true,
        enumerable: true,
        get: () => originalFetch,
        set: () => {
          // Silently ignore attempts to overwrite fetch
        }
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  if (!patch(window)) {
    patch(globalThis);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
