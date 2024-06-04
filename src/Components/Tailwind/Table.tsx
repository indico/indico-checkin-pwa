import {ChangeEvent, useState, useMemo, useRef, useEffect} from 'react';
import {
  ArrowSmallLeftIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import {Participant} from '../../db/db';
import {makeDebounce} from '../../utils/debounce';
import {
  Filters,
  ParticipantFilters,
  RegistrationState,
  ResultCount,
  ToggleFiltersButton,
  isDefaultFilterState,
  makeDefaultFilterState,
} from './filters';
import Typography from './Typography';

export interface SearchData {
  searchValue: string;
  filters: Filters;
}

const debounce = makeDebounce(50);

export default function Table({
  participants,
  searchData,
  setSearchData,
  onRowClick,
}: {
  participants: Participant[];
  searchData: SearchData;
  setSearchData: (data: SearchData) => void;
  onRowClick: (p: Participant) => void;
}) {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const {filters, searchValue} = searchData;
  const defaultVisibleParticipants = 100;
  const [numberVisibleParticipants, setNumberVisibleParticipants] = useState(
    defaultVisibleParticipants
  );

  const setFilters = (f: Filters) => {
    setSearchData({...searchData, filters: f});
    setNumberVisibleParticipants(defaultVisibleParticipants);
  };
  const setSearchValue = (v: string) => {
    setSearchData({...searchData, searchValue: v});
    setNumberVisibleParticipants(defaultVisibleParticipants);
  };
  const resetSearchData = () => {
    setSearchData({searchValue: '', filters: makeDefaultFilterState()});
    setNumberVisibleParticipants(defaultVisibleParticipants);
  };

  const filteredParticipants = useMemo(
    () => filterParticipants(participants, searchData),
    [participants, searchData]
  );

  const rows = filteredParticipants
    .slice(0, numberVisibleParticipants)
    .map((p, i) => (
      <Row
        key={p.id}
        fullName={p.fullName}
        checkedIn={p.checkedIn}
        state={p.state}
        isEven={i % 2 === 0}
        onClick={() => onRowClick(p)}
      />
    ));

  useEffect(() => {
    function onScroll() {
      const almostAtTheBottom =
        window.innerHeight + document.documentElement.scrollTop >=
        0.95 * document.documentElement.scrollHeight;

      if (almostAtTheBottom) {
        debounce(() => {
          setNumberVisibleParticipants(v => {
            if (v + 100 >= filteredParticipants.length) {
              return filteredParticipants.length;
            }
            return v + 100;
          });
        });
      }
    }

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [filteredParticipants.length]);

  const filtersActive = searchValue !== '' || !isDefaultFilterState(filters);

  return (
    <div>
      <div className="flex gap-2 px-4 pb-2 pt-4">
        <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} />
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
      {filtersActive && (
        <div className="mb-4 mt-2">
          <ResultCount count={filteredParticipants.length} onClick={resetSearchData} />
        </div>
      )}
      <div className="mx-4 mt-2">
        {rows.length === 0 && (
          <div className="mt-10 flex flex-col items-center justify-center rounded-xl">
            <div className="w-24 text-gray-500">
              <UserGroupIcon />
            </div>
          </div>
        )}
        <table className="w-full overflow-hidden rounded-xl text-left text-sm text-gray-500 dark:text-gray-400">
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  );
}

function compareNames(a: string, b: string): number {
  return a.localeCompare(b);
}

function compareDefault(a: any, b: any): number {
  if (a > b) {
    return 1;
  } else if (a < b) {
    return -1;
  } else {
    return 0;
  }
}

function filterParticipants(participants: Participant[], data: SearchData) {
  const {searchValue, filters} = data;

  return participants
    .filter(p => {
      let checkedInValues = [];
      if (filters.checkedIn.yes) {
        checkedInValues.push(true);
      }
      if (filters.checkedIn.no) {
        checkedInValues.push(false);
      }

      const stateValues = Object.entries(filters.state)
        .filter(([, v]) => v)
        .map(([k]) => k);

      return (
        (checkedInValues.length === 0 || checkedInValues.includes(p.checkedIn)) &&
        (stateValues.length === 0 || stateValues.includes(p.state)) &&
        p.fullName.toLowerCase().includes(searchValue)
      );
    })
    .sort((a, b) => {
      const {key, ascending} = filters.sortBy;
      if (!ascending) {
        [b, a] = [a, b];
      }
      if (key === 'fullName') {
        return compareNames(a.fullName, b.fullName);
      } else {
        return compareDefault(a[key], b[key]);
      }
    });
}

interface RowProps {
  fullName: string;
  checkedIn: boolean;
  state: RegistrationState;
  onClick: () => void;
  isEven: boolean;
}

function Row({fullName, checkedIn, state, onClick, isEven}: RowProps) {
  const background: HTMLElement['className'] = isEven
    ? 'bg-gray-200 dark:bg-gray-800 active:bg-gray-300 dark:active:bg-gray-600'
    : 'bg-gray-100 dark:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600';

  return (
    <tr
      style={{WebkitTapHighlightColor: 'transparent'}}
      className={`${background} cursor-pointer select-none active:bg-gray-300
                  active:transition-all dark:active:bg-gray-600`}
      onClick={onClick}
    >
      <td className="p-4">
        <div className="flex items-center justify-between">
          <Typography
            variant="body1"
            className={
              state === 'rejected' || state === 'withdrawn'
                ? 'select-none line-through'
                : 'select-none'
            }
          >
            {fullName}
          </Typography>
          <div className="flex">
            {state === 'pending' && <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />}
            {state === 'unpaid' && <BanknotesIcon className="h-6 w-6 text-yellow-500" />}
            {checkedIn && <CheckCircleIcon className="h-6 w-6 text-green-500" />}
          </div>
        </div>
      </td>
    </tr>
  );
}

function SearchInput({
  searchValue,
  setSearchValue,
}: {
  searchValue: string;
  setSearchValue: (v: string) => void;
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value.toLowerCase());
  };

  const onKeyUp = (e: any) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative grow">
      {searchFocused && <LoseFocusButton />}
      {!searchFocused && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
        </div>
      )}
      {searchValue && <ClearSearchButton onClick={clearSearch} />}
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
  );
}

function LoseFocusButton() {
  return (
    <div className="absolute inset-y-0 left-0 flex items-center pl-1">
      <button type="button" className="p-1">
        <ArrowSmallLeftIcon className="min-w-[2rem] text-gray-800 dark:text-gray-300" />
      </button>
    </div>
  );
}

function ClearSearchButton({onClick}: {onClick: () => void}) {
  return (
    <div className="absolute inset-y-0 right-0 flex items-center pr-1">
      <button
        type="button"
        className="rounded-full p-2 transition-all active:bg-gray-200 dark:active:bg-gray-500"
        onClick={onClick}
      >
        <XMarkIcon className="min-w-[1.5rem] text-gray-800 dark:text-gray-300" />
      </button>
    </div>
  );
}
