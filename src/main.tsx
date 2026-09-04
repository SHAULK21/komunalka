import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safety safeguard for sandboxed iframe environments where window.fetch has only a getter
try {
  let _fetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    get() {
      return _fetch;
    },
    set(fn) {
      _fetch = fn;
    },
    configurable: true,
    enumerable: true,
  });
} catch (_) {
  // Ignore if already configured or protected
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
