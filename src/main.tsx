// Patch window.fetch proxy for sandboxed iframe environments where window.fetch is getter-only
(function patchWindowFetch() {
  try {
    const originalFetch = window.fetch;
    // Attempt to redefine window.fetch with a writable property descriptor
    Object.defineProperty(window, 'fetch', {
      value: originalFetch,
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    console.warn("[Fetch Sandbox Patch] Direct redefinition failed, creating proxy getter/setter", e);
    try {
      let currentFetch = window.fetch;
      Object.defineProperty(window, 'fetch', {
        get() {
          return currentFetch;
        },
        set(newValue) {
          currentFetch = newValue;
        },
        configurable: true,
        enumerable: true
      });
    } catch (innerError) {
      console.error("[Fetch Sandbox Patch] CRITICAL: Window fetch is immutable in this preview container:", innerError);
    }
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
