import {ChangeEvent, useState, useMemo, useRef} from 'react';
import {
  ArrowSmallLeftIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import {
  Filters,
  ParticipantFilters,
  ResultCount,
  ToggleFiltersButton,
  isDefaultFilterState,
  makeDefaultFilterState,
} from './filters';
import Typography from './Typography';

/**
 * Props of a Single Row in the table
 */
export interface rowProps {
  fullName: string;
  checkedIn: boolean;
  state: string;
  registrationDate: string;
  onClick?: () => void;
}

const Table = ({
  rows,
  searchValue,
  setSearchValue,
  filters,
  setFilters,
}: {
  rows: rowProps[];
  searchValue: string;
  setSearchValue: (v: string) => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const shownRows = useMemo(() => {
    if (rows.length === 0) {
      return rows;
    }

    return rows
      .filter(row => {
        let checkedInValues = [];
        if (filters.checkedIn.yes) {
          checkedInValues.push(true);
        }
        if (filters.checkedIn.no) {
          checkedInValues.push(false);
        }

        const stateValues = Object.entries(filters.state)
          .filter(([k, v]) => v)
          .map(([k, v]) => k);

        return (
          (checkedInValues.length === 0 || checkedInValues.includes(row.checkedIn)) &&
          (stateValues.length === 0 || stateValues.includes(row.state)) &&
          row.fullName.toLowerCase().includes(searchValue)
        );
      })
      .sort((a, b) => {
        const {key, ascending} = filters.sortBy;
        if (!ascending) {
          [b, a] = [a, b];
        }
        if (a[key] > b[key]) {
          return 1;
        } else if (a[key] < b[key]) {
          return -1;
        } else {
          return 0;
        }
      });
  }, [searchValue, filters, rows]);

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value.toLowerCase());
  };

  const onKeyUp = (e: any) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const filteredRows = shownRows.map(({fullName, checkedIn, state, onClick}, idx) => {
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
            <Typography
              variant="body1"
              className={state === 'rejected' || state === 'withdrawn' ? 'line-through' : ''}
            >
              {fullName}
            </Typography>
            {checkedIn && <CheckCircleIcon className="h-6 w-6 text-green-500" />}
          </div>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <div className="flex gap-2 px-4 pb-2 pt-4">
        <div className="relative grow">
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
            className="text-md block w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-2.5
                       text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-transparent dark:bg-gray-700
                       dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Search participants..."
            value={searchValue}
            onChange={onSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyUp={onKeyUp}
          />
        </div>
        <ToggleFiltersButton
          defaultState={isDefaultFilterState(filters)}
          filtersVisible={filtersVisible}
          onClick={() => setFiltersVisible(v => !v)}
        />
      </div>
      {filtersVisible && (
        <div className="px-4 pb-2">
          <ParticipantFilters
            filters={filters}
            setFilters={setFilters}
            onClose={() => setFiltersVisible(false)}
          />
        </div>
      )}
      {(searchValue !== '' || !isDefaultFilterState(filters)) && (
        <div className="mb-4 mt-2">
          <ResultCount
            count={filteredRows.length}
            onClick={() => {
              setSearchValue('');
              setFilters(makeDefaultFilterState());
            }}
          />
        </div>
      )}
      <div className="mx-4 mt-2">
        {filteredRows.length === 0 && (
          <div className="mt-10 flex flex-col items-center justify-center rounded-xl">
            <div className="w-24 text-gray-500">
              <UserGroupIcon />
            </div>
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
