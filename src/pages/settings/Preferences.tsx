import {useState, useEffect} from 'react';
import {ChevronDownIcon, SunIcon, MoonIcon, DevicePhoneMobileIcon} from '@heroicons/react/20/solid';
import {OptionsSwitch, SwitchOption} from '../../Components/OptionsSwitch';
import {SettingToggle} from '../../Components/SettingsToggle';
import {Typography} from '../../Components/Tailwind';
import {SimpleButton} from '../../Components/Tailwind/Button';
import TopNav from '../../Components/TopNav';
import useSettings from '../../hooks/useSettings';
import {ThemeMode} from '../../hooks/useTheme';
import {playSound, sounds} from '../../utils/sound';

const themeOptions: SwitchOption<ThemeMode>[] = [
  {value: 'light', icon: SunIcon, label: 'Light'},
  {value: 'system', icon: DevicePhoneMobileIcon, label: 'System'},
  {value: 'dark', icon: MoonIcon, label: 'Dark'},
];

export default function PreferencesPage() {
  const {themeMode, setThemeMode, soundEffect, setSoundEffect, hapticFeedback, setHapticFeedback} =
    useSettings();

  const onSoundEffectChange = (v: string) => {
    localStorage.setItem('soundEffect', v);
    setSoundEffect(v);
    playSound(v);
  };

  const toggleHapticFeedback = () => {
    localStorage.setItem('hapticFeedback', (!hapticFeedback).toString());
    setHapticFeedback(!hapticFeedback);
  };

  return (
    <>
      <TopNav backBtnText="Preferences" backNavigateTo="/settings" />
      <div className="flex flex-col gap-4 p-4">
        <OptionsSwitch
          title="Theme"
          value={themeMode}
          options={themeOptions}
          onChange={setThemeMode}
        />
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
      </div>
    </>
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
