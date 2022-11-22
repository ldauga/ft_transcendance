import React from 'react';
import App from './App';
import './index.css'
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './State/index';
import { CookiesProvider } from 'react-cookie';

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(
  <CookiesProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </CookiesProvider>
);
