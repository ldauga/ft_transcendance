import React from 'react';
import App from './App';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './State/index';
import { CookiesProvider } from 'react-cookie';

const container = document.getElementById('app');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <React.StrictMode>
    <CookiesProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </CookiesProvider>
  </React.StrictMode>,
);
