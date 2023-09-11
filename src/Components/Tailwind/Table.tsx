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
        ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600'
        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600';

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
            {checkedIn && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
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
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
            </div>
          )}
          {searchValue && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-1">
              <button
                type="button"
                className="p-2 transition-all rounded-full active:bg-gray-200 dark:active:bg-gray-500"
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-full focus:ring-blue-500
                       focus:border-blue-500 block w-full pl-10 pr-2.5 py-3 dark:bg-gray-700 dark:border-gray-600
                       dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
          <div className="flex flex-col items-center justify-center mt-2 rounded-xl">
            <div className="w-14 text-gray-500">
              <UserGroupIcon />
            </div>
            <Typography variant="h3">Not found</Typography>
          </div>
        )}
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 rounded-xl overflow-hidden">
          <tbody>{filteredRows.length > 0 && <>{filteredRows}</>}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
