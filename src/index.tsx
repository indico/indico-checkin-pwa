import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// TODO: fix the unresolved import warning
// https://github.com/vite-pwa/vite-plugin-pwa/issues/40
// https://github.com/vite-pwa/vite-plugin-pwa/issues/38
// @ts-expect-error Cannot find module 'virtual:pwa-register' or its corresponding type declarations.
import {registerSW} from 'virtual:pwa-register'; // eslint-disable-line import/no-unresolved
import App from './App';
import {LogsProvider} from './context/LogsProvider';
import {ModalContextProvider} from './context/ModalContextProvider';
import {SettingsProvider} from './context/SettingsProvider';
import db from './db/db';

// Service worker
registerSW({immediate: true});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(registration => {
      console.log('Service worker registered:', registration);

      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          console.log('New content available, refreshing...');
          window.location.reload();
        }
      });

      if (registration.waiting) {
        registration.waiting.postMessage({type: 'SKIP_WAITING'});
      }

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker controlling the page, reloading...');
        window.location.reload();
      });
    })
    .catch(error => {
      console.error('Service worker registration failed:', error);
    });
}

// DB
async function runDBCleanup() {
  await db.transaction('readwrite', db.participants, async () => {
    await db.participants.where({checkedInLoading: 1}).modify({checkedInLoading: 0});
    await db.participants.where({isPaidLoading: 1}).modify({isPaidLoading: 0});
  });
}

runDBCleanup().catch(err => console.error(err));

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ModalContextProvider>
      <SettingsProvider>
        <LogsProvider>
          <App />
        </LogsProvider>
      </SettingsProvider>
    </ModalContextProvider>
  </React.StrictMode>
);
