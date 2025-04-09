import {useEffect, useState} from 'react';
import {ChevronDownIcon} from '@heroicons/react/20/solid';
import {SimpleButton} from './Tailwind/Button';

export interface CheckType {
  id: number;
  title: string;
}

interface EventCheckInTypeDropdownProps {
  values: CheckType[];
  selected: CheckType;
  onChange: (v: CheckType) => void;
}

function EventCheckInTypeDropdown({values, selected, onChange}: EventCheckInTypeDropdownProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onOutsideClick = () => setVisible(false);
    document.addEventListener('click', onOutsideClick);
    return () => document.removeEventListener('click', onOutsideClick);
  }, []);

  return (
    <div className="relative">
      <SimpleButton
        onClick={e => {
          e.stopPropagation();
          setVisible(v => !v);
        }}
      >
        {selected?.title}
        <ChevronDownIcon className="h-5 min-w-[1.25rem]" />
      </SimpleButton>
      <div
        className={`absolute right-0 z-10 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700 ${
          visible ? '' : 'hidden'
        }`}
      >
        <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
          {values?.map(({id, title}) => (
            <li
              key={id}
              onClick={() => onChange({id, title})}
              className="block cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              {title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default EventCheckInTypeDropdown;
