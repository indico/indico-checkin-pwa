import {ElementType, ChangeEvent, useState, useMemo} from 'react';
import {MagnifyingGlassIcon} from '@heroicons/react/20/solid';
import Typography from './Typography';

/**
 * Props of a Single Row in the table
 */
export interface rowProps {
  value: string;
  useRightIcon?: boolean;
  onClick?: () => void;
}

interface TableProps {
  rows: rowProps[];
  className?: HTMLDivElement['className'];
  RightIcon?: ElementType;
}

const Table = ({rows, className = '', RightIcon}: TableProps) => {
  const [searchValue, setSearchValue] = useState('');

  const shownRows = useMemo(() => {
    if (rows.length === 0) {
      return rows;
    }

    return rows.filter(row => row.value.toLowerCase().includes(searchValue));
  }, [searchValue, rows]);

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value.toLowerCase());
  };

  return (
    <div className={className}>
      <div className="px-4 py-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-blue-500
                       focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600
                       dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search participants..."
            onChange={onSearchChange}
          />
        </div>
      </div>
      <div className="mx-4">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 rounded-xl overflow-hidden">
          <tbody>
            {shownRows.map((row, idx) => {
              const alternatingClass: HTMLElement['className'] =
                idx % 2 === 1
                  ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600';
              const showIcon = row.useRightIcon ?? false;

              return (
                <tr
                  key={idx}
                  className={`cursor-pointer ${alternatingClass}
                            active:bg-gray-300 dark:active:bg-gray-600`}
                  onClick={row.onClick}
                >
                  <td className="p-4">
                    <div className="flex items-center justify-between">
                      <Typography variant="body1">{row.value}</Typography>
                      {showIcon && RightIcon && <RightIcon className="w-6 h-6 text-green-500" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
