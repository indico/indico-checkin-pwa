import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {CheckTypeProvider} from './context/CheckTypeProvider';
import {LogsProvider} from './context/LogsProvider';
import {ModalContextProvider} from './context/ModalContextProvider';
import {SettingsProvider} from './context/SettingsProvider';
import db from './db/db';
// TODO: Replace CRA SW with VitePWA SW
// https://github.com/indico/indico-checkin-pwa/issues/72
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// DB
async function runDBCleanup() {
  await db.transaction('readwrite', db.participants, async () => {
    await db.participants.where({checkedStateLoading: 1}).modify({checkedStateLoading: 0});
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
          <CheckTypeProvider>
            <App />
          </CheckTypeProvider>
        </LogsProvider>
      </SettingsProvider>
    </ModalContextProvider>
  </React.StrictMode>
);

serviceWorkerRegistration.register();
