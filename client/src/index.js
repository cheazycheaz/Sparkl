import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { PrivyProvider } from '@privy-io/react-auth';
import App from './App';
import 'process/browser';
import { Buffer } from 'buffer';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <PrivyProvider
      appId="clx9jtfgm08in7t5z52xwr2oy"
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: '/Sparkl.png', 
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);