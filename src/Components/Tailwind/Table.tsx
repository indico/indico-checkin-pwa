import {ElementType, ChangeEvent, useState, useMemo} from 'react';
import {MagnifyingGlassIcon} from '@heroicons/react/20/solid';
import Typography from './Typography';

/**
 * Props of a Single Row in the table
 */
export interface rowProps {
  columns: string[];
  useRightIcon?: boolean;
  onClick?: () => void;
}

interface TableProps {
  columnLabels: string[];
  searchColIdx?: number;
  rows: rowProps[];
  className?: HTMLDivElement['className'];
  RightIcon?: ElementType;
}

/**
 * Inspiration from: https://flowbite.com/docs/components/tables/#table-search
 * @param param0
 * @returns
 */
const Table = ({columnLabels, rows, className = '', RightIcon, searchColIdx = 0}: TableProps) => {
  const [searchValue, setSearchValue] = useState('');

  const shownRows = useMemo(() => {
    if (rows.length === 0) return rows; // No rows to search
    if (rows[0].columns.length <= searchColIdx) return rows; // No columns to search

    // The first column is the searchable row (TODO: Can pass the index by param to the Component)
    return rows.filter(row => row.columns[searchColIdx].toLowerCase().includes(searchValue));
  }, [searchValue, rows, searchColIdx]);

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value.toLowerCase());
  };

  return (
    <div className={className}>
      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500
                       focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600
                       dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search participants..."
            onChange={onSearchChange}
          />
        </div>
      </div>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <tbody>
          {shownRows.map((row, idx) => {
            const alternatingClass: HTMLElement['className'] =
              idx % 2 === 1
                ? 'bg-gray-100 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-700'
                : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700';
            const showIcon = row.useRightIcon ?? false;

            return (
              <tr
                key={idx}
                className={`cursor-pointer border-b ${alternatingClass} dark:border-gray-700
                            active:bg-gray-300 dark:active:bg-gray-600`}
                onClick={row.onClick}
              >
                {row.columns.map((cell, cellIdx) => {
                  const isLastCell = cellIdx === row.columns.length - 1;

                  return (
                    <td key={cellIdx} className="p-4">
                      <div className="flex items-center justify-between">
                        <Typography variant="body1">{cell}</Typography>

                        {showIcon && isLastCell && RightIcon && (
                          <RightIcon className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
