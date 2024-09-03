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

registerSW({immediate: true});

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
