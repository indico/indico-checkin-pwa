import {useEffect, useState} from 'react';
import {ChevronDownIcon, TrashIcon, WrenchScrewdriverIcon} from '@heroicons/react/20/solid';
import PropTypes from 'prop-types';
import beep1 from '../assets/beep1.mp3';
import beep2 from '../assets/beep2.mp3';
import blip from '../assets/blip.mp3';
import levelUp from '../assets/level-up.mp3';
import {Typography} from '../Components/Tailwind';
import {DangerButton, SimpleButton} from '../Components/Tailwind/Button';
import {Toggle} from '../Components/Tailwind/Toggle';
import TopTab from '../Components/TopTab';
import db from '../db/db';
import useSettings from '../hooks/useSettings';

const soundEffects = {
  'None': null,
  'Beep 1': beep1,
  'Beep 2': beep2,
  'Blip': blip,
  'Level up': levelUp,
};

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
    const sound = soundEffects[v];
    if (sound) {
      new Audio(sound).play();
    }
  };

  return (
    <>
      <TopTab />
      <div className="p-4 flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
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
                title="Sound effect"
                values={Object.keys(soundEffects)}
                selected={soundEffect}
                onChange={onSoundEffectChange}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
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
          <div className="flex flex-col gap-6 p-6 bg-gray-200 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center justify-center gap-2">
              <Typography variant="h3">Running in development mode</Typography>
              <WrenchScrewdriverIcon className="min-w-[1.25rem] h-5 dark:text-gray-300" />
            </div>
            <DangerButton
              className="w-fit self-center"
              onClick={async () => {
                await db.delete();
                await db.open();
              }}
            >
              <TrashIcon className="min-w-[1.25rem] h-5" />
              Reset IndexedDB
            </DangerButton>
          </div>
        )}
      </div>
    </>
  );
};

function SettingsToggle({title, description, checked, onToggle}) {
  return (
    <div className="flex justify-between items-center gap-4">
      <div>
        <Typography variant="h4">{title}</Typography>
        {description && <Typography variant="body2">{description}</Typography>}
      </div>
      <div>
        <Toggle size="md" checked={checked} onClick={onToggle} />
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
    <div className="flex justify-between items-center gap-4">
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
          <ChevronDownIcon className="min-w-[1.25rem] h-5" />
        </SimpleButton>
        <div
          className={`absolute right-0 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 ${
            visible ? '' : 'hidden'
          }`}
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            {values.map(v => (
              <li
                key={v}
                onClick={() => onChange(v)}
                className="block px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
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
