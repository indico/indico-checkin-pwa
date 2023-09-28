import {ChangeEvent, useState, useMemo, useRef} from 'react';
import {
  ArrowSmallLeftIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import Typography from './Typography';

/**
 * Props of a Single Row in the table
 */
export interface rowProps {
  fullName: string;
  checkedIn: boolean;
  onClick?: () => void;
}

interface TableProps {
  rows: rowProps[];
  className?: HTMLDivElement['className'];
}

const Table = ({rows, className = ''}: TableProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const shownRows = useMemo(() => {
    if (rows.length === 0) {
      return rows;
    }

    return rows.filter(row => row.fullName.toLowerCase().includes(searchValue));
  }, [searchValue, rows]);

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value.toLowerCase());
  };

  const onKeyUp = (e: any) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const filteredRows = shownRows.map(({fullName, checkedIn, onClick}, idx) => {
    const alternatingClass: HTMLElement['className'] =
      idx % 2 === 1
        ? 'bg-gray-100 dark:bg-gray-800 active:bg-gray-300 dark:active:bg-gray-600'
        : 'bg-gray-200 dark:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600';

    return (
      <tr
        key={idx}
        style={{WebkitTapHighlightColor: 'transparent'}}
        className={`cursor-pointer ${alternatingClass} transition-all
                  active:bg-gray-300 dark:active:bg-gray-600`}
        onClick={onClick}
      >
        <td className="p-4">
          <div className="flex items-center justify-between">
            <Typography variant="body1">{fullName}</Typography>
            {checkedIn && <CheckCircleIcon className="h-6 w-6 text-green-500" />}
          </div>
        </td>
      </tr>
    );
  });

  return (
    <div className={className}>
      <div className="px-4 py-4">
        <div className="relative w-full">
          {searchFocused && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-1">
              <button type="button" className="p-1">
                <ArrowSmallLeftIcon className="min-w-[2rem] text-gray-800 dark:text-gray-300" />
              </button>
            </div>
          )}
          {!searchFocused && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
            </div>
          )}
          {searchValue && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-1">
              <button
                type="button"
                className="rounded-full p-2 transition-all active:bg-gray-200 dark:active:bg-gray-500"
                onClick={() => {
                  setSearchValue('');
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <XMarkIcon className="min-w-[1.5rem] text-gray-800 dark:text-gray-300" />
              </button>
            </div>
          )}
          <input
            type="text"
            ref={inputRef}
            className="text-md block w-full rounded-full border border-gray-300 bg-gray-50 py-3 pl-10 pr-2.5
                       text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700
                       dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Search participants..."
            value={searchValue}
            onChange={onSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyUp={onKeyUp}
          />
        </div>
      </div>
      <div className="mx-4">
        {filteredRows.length === 0 && (
          <div className="mt-2 flex flex-col items-center justify-center rounded-xl">
            <div className="w-14 text-gray-500">
              <UserGroupIcon />
            </div>
            <Typography variant="h3">Not found</Typography>
          </div>
        )}
        <table className="w-full overflow-hidden rounded-xl text-left text-sm text-gray-500 dark:text-gray-400">
          <tbody>{filteredRows.length > 0 && <>{filteredRows}</>}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
