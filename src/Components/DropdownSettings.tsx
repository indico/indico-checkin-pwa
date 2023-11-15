import {ReactNode, useEffect, useState} from 'react';
import {EllipsisVerticalIcon} from '@heroicons/react/20/solid';

export interface SettingsItem {
  text: string;
  icon: ReactNode;
  onClick: () => void;
}

export default function DropdownSettings({items}: {items: SettingsItem[]}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onClick = () => {
      setIsVisible(false);
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          setIsVisible(v => !v);
        }}
        className="inline-flex items-center rounded-full p-2 text-center text-sm font-medium text-gray-700
                   transition-all focus:bg-blue-200/30 focus:outline-none dark:text-gray-100 dark:focus:bg-blue-800/30"
      >
        <EllipsisVerticalIcon className="min-h-[1.5rem] min-w-[1.5rem]" />
      </button>
      <ul
        className={`absolute right-0 top-full z-10 w-max divide-y divide-gray-100 rounded-lg bg-white py-2 text-sm
                   text-gray-700 shadow dark:divide-gray-600 dark:bg-gray-700 dark:text-gray-200 ${
                     isVisible ? '' : 'hidden'
                   }`}
      >
        {items.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              className="flex w-full gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={item.onClick}
            >
              <span className="h-5 min-w-[1.25rem]">{item.icon}</span>
              <span>{item.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
