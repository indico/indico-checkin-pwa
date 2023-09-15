import {useEffect, useState} from 'react';
import {EllipsisVerticalIcon} from '@heroicons/react/20/solid';
import PropTypes from 'prop-types';

export default function DropdownSettings({items}) {
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
        className="inline-flex items-center rounded-full p-2 text-center text-sm
                   font-medium text-gray-100 transition-all
                   focus:bg-blue-700 focus:outline-none
                   dark:focus:bg-blue-600"
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
              <span className="h-5 min-w-[1.25rem] text-red-700 dark:text-red-500">
                {item.icon}
              </span>
              <span>{item.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

DropdownSettings.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    })
  ),
};
