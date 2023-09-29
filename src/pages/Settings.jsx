import {useEffect, useState} from 'react';
import {ChevronDownIcon, TrashIcon, WrenchScrewdriverIcon} from '@heroicons/react/20/solid';
import PropTypes from 'prop-types';
import BottomNav from '../Components/BottomNav';
import {Typography} from '../Components/Tailwind';
import {DangerButton, SimpleButton} from '../Components/Tailwind/Button';
import {Toggle} from '../Components/Tailwind/Toggle';
import TopNav from '../Components/TopNav';
import db from '../db/db';
import useSettings from '../hooks/useSettings';
import {playSound, sounds} from '../utils/sound';

const SettingsPage = () => {
  const {darkMode, setDarkMode, autoCheckin, setAutoCheckin, soundEffect, setSoundEffect} =
    useSettings();
  const isDev = process.env.NODE_ENV === 'development';

  const toggleDarkMode = () => {
    // Set the theme preference in localStorage and in the SettingsContext
    const newDarkMode = !darkMode;
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    setDarkMode(newDarkMode);
  };

  const toggleAutoCheckin = () => {
    localStorage.setItem('autoCheckin', !autoCheckin);
    setAutoCheckin(!autoCheckin);
  };

  const onSoundEffectChange = v => {
    localStorage.setItem('soundEffect', v);
    setSoundEffect(v);
    playSound(v);
  };

  return (
    <>
      <TopNav />
      <div className="flex flex-col gap-12 p-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="border-b border-slate-200 pb-2 dark:border-slate-700">
              <Typography variant="body3" className="font-semibold uppercase text-gray-500">
                Check-in
              </Typography>
            </div>
            <div className="flex flex-col gap-4">
              <SettingsToggle
                title="Automatic check-in"
                description="Check in when a QR code is scanned"
                checked={autoCheckin}
                onToggle={toggleAutoCheckin}
              />
              <SettingsDropdown
                title="Check-in sound effect"
                values={Object.keys(sounds)}
                selected={soundEffect}
                onChange={onSoundEffectChange}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="border-b border-slate-200 pb-2 dark:border-slate-700">
              <Typography variant="body3" className="font-semibold uppercase text-gray-500">
                Appearance
              </Typography>
            </div>
            <div className="flex flex-col gap-4">
              <SettingsToggle title="Dark theme" checked={darkMode} onToggle={toggleDarkMode} />
            </div>
          </div>
        </div>
        {isDev && (
          <div className="flex flex-col gap-6 rounded-xl bg-gray-200 p-6 dark:bg-gray-700">
            <div className="flex items-center justify-center gap-2">
              <Typography variant="h3">Running in development mode</Typography>
              <WrenchScrewdriverIcon className="h-5 min-w-[1.25rem] dark:text-gray-300" />
            </div>
            <DangerButton
              className="w-fit self-center"
              onClick={async () => {
                await db.delete();
                await db.open();
              }}
            >
              <TrashIcon className="h-5 min-w-[1.25rem]" />
              Reset IndexedDB
            </DangerButton>
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
};

function SettingsToggle({title, description, checked, onToggle}) {
  return (
    <div className="flex items-center justify-between gap-4" onClick={onToggle}>
      <div>
        <Typography variant="h4">{title}</Typography>
        {description && <Typography variant="body2">{description}</Typography>}
      </div>
      <div>
        <Toggle size="md" checked={checked} />
      </div>
    </div>
  );
}

SettingsToggle.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

SettingsToggle.defaultProps = {
  description: null,
};

function SettingsDropdown({title, description, values, selected, onChange}) {
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

SettingsDropdown.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  values: PropTypes.array.isRequired,
  selected: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

SettingsDropdown.defaultProps = {
  description: null,
};

export default SettingsPage;
