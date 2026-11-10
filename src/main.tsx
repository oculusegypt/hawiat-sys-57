import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import App from '@/App';
import '@/index.css';

// Register auth token getter so all API calls send Authorization Bearer header
setAuthTokenGetter(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('admin_token');
  }
  return null;
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
