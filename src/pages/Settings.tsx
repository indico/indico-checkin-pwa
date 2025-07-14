import {ReactNode, useEffect, useState} from 'react';
import {ChevronDownIcon, DocumentDuplicateIcon, ArrowPathIcon} from '@heroicons/react/20/solid';
import {Typography} from '../Components/Tailwind';
import Button, {DangerButton, SimpleButton} from '../Components/Tailwind/Button';
import {Toggle} from '../Components/Tailwind/Toggle';
import TopNav from '../Components/TopNav';
import {Log} from '../context/LogsProvider';
import db from '../db/db';
import {useHandleError} from '../hooks/useError';
import {useLogs} from '../hooks/useLogs';
import {useConfirmModal} from '../hooks/useModal';
import useSettings from '../hooks/useSettings';
import {playSound, sounds} from '../utils/sound';

export default function SettingsPage() {
  return (
    <>
      <TopNav backBtnText="Settings" backNavigateTo={-1} />
      <div className="flex flex-col gap-6 p-4">
        <MainSettings />
        <DebugSettings />
        <LogSettings />
      </div>
    </>
  );
}

function MainSettings() {
  const {
    darkMode,
    setDarkMode,
    autoCheckin,
    setAutoCheckin,
    rapidCheckin,
    setRapidCheckin,
    soundEffect,
    setSoundEffect,
    hapticFeedback,
    setHapticFeedback,
  } = useSettings();

  const toggleDarkMode = () => {
    // Set the theme preference in localStorage and in the SettingsContext
    const newDarkMode = !darkMode;
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    setDarkMode(newDarkMode);
  };

  const toggleAutoCheckin = () => {
    localStorage.setItem('autoCheckin', (!autoCheckin).toString());
    setAutoCheckin(!autoCheckin);
  };

  const toggleRapicCheckin = () => {
    localStorage.setItem('rapidCheckin', (!rapidCheckin).toString());
    setRapidCheckin(!rapidCheckin);
  };

  const toggleHapticFeedback = () => {
    localStorage.setItem('hapticFeedback', (!hapticFeedback).toString());
    setHapticFeedback(!hapticFeedback);
  };

  const onSoundEffectChange = (v: string) => {
    localStorage.setItem('soundEffect', v);
    setSoundEffect(v);
    playSound(v);
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection title="Check-in">
        <SettingToggle
          title="Automatic check-in"
          description="Check in when a QR code is scanned"
          checked={autoCheckin}
          onToggle={toggleAutoCheckin}
        />
        {autoCheckin && (
          <SettingToggle
            title="Rapid check-in"
            description="Automatically return to the scan page after each check-in"
            checked={rapidCheckin}
            onToggle={toggleRapicCheckin}
          />
        )}
        <SettingDropdown
          title="Check-in sound effect"
          values={Object.keys(sounds)}
          selected={soundEffect}
          onChange={onSoundEffectChange}
        />
        <SettingToggle
          title="Haptic feedback"
          description="Vibrate on certain interactions (e.g. check-in, error etc.)"
          checked={hapticFeedback}
          onToggle={toggleHapticFeedback}
        />
      </SettingsSection>
      <SettingsSection title="Appearance">
        <SettingToggle title="Dark theme" checked={darkMode} onToggle={toggleDarkMode} />
      </SettingsSection>
    </div>
  );
}

function DebugSettings() {
  const version = import.meta.env.VITE_APP_VERSION;
  const confirmModal = useConfirmModal();
  const handleError = useHandleError();

  async function resetApp() {
    localStorage.clear();
    try {
      await db.delete();
      await db.open();
    } catch (e) {
      handleError(e, 'Error resetting the database');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection title="Debugging">
        <Setting title="App version">
          <Typography variant="body2">{version}</Typography>
        </Setting>
        <Setting title="Reset" description="Delete all application data">
          <DangerButton
            className="w-fit self-center"
            onClick={() => {
              confirmModal({
                title: 'Are you sure?',
                content: 'This will permanently delete all application data',
                confirmBtnText: 'Reset',
                onConfirm: resetApp,
              });
            }}
          >
            <ArrowPathIcon className="h-5 min-w-[1.25rem]" />
            Reset
          </DangerButton>
        </Setting>
      </SettingsSection>
    </div>
  );
}

function LogSettings() {
  const {logs} = useLogs();
  const version = import.meta.env.VITE_APP_VERSION;
  const isProduction = import.meta.env.PROD;

  function onCopy() {
    const text = `App version: ${version}\n\nLogs:\n${formatLogs(logs)}`;
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection title="Logs">
        <Setting title="Copy to clipboard">
          <Button onClick={onCopy}>
            <DocumentDuplicateIcon className="h-5 min-w-[1.25rem]" />
          </Button>
        </Setting>
        {!isProduction && (
          <div className="flex items-center justify-between gap-4">
            {logs.length === 0 && <Typography variant="body2">No logs available</Typography>}
            {logs.length > 0 && (
              <div className="flex max-h-[40vh] flex-col-reverse overflow-y-auto">
                <code className="flex flex-col gap-2">
                  {logs.map((log, idx) => (
                    <Typography key={idx} variant="body3" className="break-all">
                      <LogEntry log={log} />
                    </Typography>
                  ))}
                </code>
              </div>
            )}
          </div>
        )}
      </SettingsSection>
    </div>
  );
}

function LogEntry({log}: {log: Log}) {
  return (
    <>
      <b>{log.timestamp.toISOString().slice(0, -5)}</b> {log.severity.toUpperCase().padStart(5)}{' '}
      {log.message}
    </>
  );
}

export function formatLog(log: Log) {
  return `${log.timestamp.toISOString().slice(0, -5)} ${log.severity.toUpperCase().padStart(5)} ${
    log.message
  }`;
}

export function formatLogs(logs: Log[]) {
  return logs.map(formatLog).join('\n');
}

function SettingsSection({title, children}: {title: string; children: ReactNode}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-slate-200 pb-2 dark:border-slate-700">
        <Typography variant="body3" className="font-semibold uppercase text-gray-500">
          {title}
        </Typography>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

interface SettingProps {
  title: string;
  description?: string;
  onClick?: () => void;
  children: ReactNode;
}

function Setting({title, description, onClick, children}: SettingProps) {
  return (
    <div className="flex items-center justify-between gap-4" onClick={onClick}>
      <div>
        <Typography variant="h4">{title}</Typography>
        {description && <Typography variant="body2">{description}</Typography>}
      </div>
      <div>{children}</div>
    </div>
  );
}

interface SettingToggleProps {
  title: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
}

function SettingToggle({title, description, checked, onToggle}: SettingToggleProps) {
  return (
    <Setting title={title} description={description} onClick={onToggle}>
      <Toggle size="md" checked={checked} />
    </Setting>
  );
}

interface SettingsDropdownProps {
  title: string;
  description?: string;
  values: string[];
  selected: string;
  onChange: (v: string) => void;
}

function SettingDropdown({title, description, values, selected, onChange}: SettingsDropdownProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onOutsideClick = () => setVisible(false);
    document.addEventListener('click', onOutsideClick);
    return () => document.removeEventListener('click', onOutsideClick);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Typography variant="h4">{title}</Typography>
        {description && <Typography variant="body2">{description}</Typography>}
      </div>
      <div className="relative">
        <SimpleButton
          onClick={e => {
            e.stopPropagation();
            setVisible(v => !v);
          }}
        >
          {selected}
          <ChevronDownIcon className="h-5 min-w-[1.25rem]" />
        </SimpleButton>
        <div
          className={`absolute right-0 z-10 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700 ${
            visible ? '' : 'hidden'
          }`}
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            {values.map(v => (
              <li
                key={v}
                onClick={() => onChange(v)}
                className="block cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
