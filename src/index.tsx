import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {LogsProvider} from './context/LogsProvider';
import {ModalContextProvider} from './context/ModalContextProvider';
import {SettingsProvider} from './context/SettingsProvider';
import db from './db/db';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
