import {ReactNode} from 'react';
import {FunnelIcon as FunnelIconOutline} from '@heroicons/react/24/outline';
import {FunnelIcon, XMarkIcon, ArrowUpIcon, CheckIcon} from '@heroicons/react/24/solid';
import {RegistrationTag, RegistrationTagColor} from '../../db/db';
import {titleCase} from '../../utils/case';
import Button from './Button';
import Typography from './Typography';

const registrationStates = ['complete', 'pending', 'unpaid', 'rejected', 'withdrawn'];

const tagColorClasses: Record<RegistrationTagColor, string> = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  violet: 'bg-violet-500',
  teal: 'bg-teal-500',
  olive: 'bg-lime-300',
  brown: 'bg-amber-900',
  grey: 'bg-neutral-500',
  black: 'bg-stone-950',
};

export type RegistrationState = 'complete' | 'pending' | 'unpaid' | 'rejected' | 'withdrawn';

interface CheckedInFilterData {
  yes: boolean;
  no: boolean;
}

interface RegistrationStateFilterData {
  complete: boolean;
  pending: boolean;
  unpaid: boolean;
  rejected: boolean;
  withdrawn: boolean;
}

type RegistrationTagsFilterData = Record<string, boolean>;

type SortKey = 'fullName' | 'registrationDate';

interface SortFilterData {
  key: SortKey;
  ascending: boolean;
}

export interface Filters {
  checkedIn: CheckedInFilterData;
  state: RegistrationStateFilterData;
  tags: RegistrationTagsFilterData;
  sortBy: SortFilterData;
}

export function makeDefaultFilterState() {
  return {
    checkedIn: {yes: false, no: false},
    state: {
      complete: false,
      pending: false,
      unpaid: false,
      rejected: false,
      withdrawn: false,
    },
    tags: {},
    sortBy: {key: 'fullName' as SortKey, ascending: true},
  };
}

export function isDefaultFilterState(filters: Filters) {
  const {checkedIn, state, sortBy} = filters;

  return (
    Object.values(checkedIn).every(v => !v) &&
    Object.values(state).every(v => !v) &&
    sortBy.key === 'fullName' &&
    sortBy.ascending
  );
}

export function ParticipantFilters({
  filters,
  setFilters,
  onClose,
  registrationTags,
}: {
  filters: Filters;
  setFilters: (v: Filters) => void;
  onClose: () => void;
  registrationTags: RegistrationTag[];
}) {
  const {checkedIn, state, tags, sortBy} = filters;
  const reset = () => setFilters(makeDefaultFilterState());

  return (
    <div className="rounded-xl bg-gray-100 p-4 dark:bg-gray-700">
      <div className="relative flex flex-col gap-4">
        {!isDefaultFilterState(filters) && (
          <div className="absolute right-[-0.5rem] top-[-0.5rem]">
            <Typography variant="body2">
              <button
                className="flex items-center rounded-xl p-2 pl-3 transition-all active:bg-gray-300 dark:active:bg-gray-800"
                onClick={reset}
              >
                Clear
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Typography>
          </div>
        )}
        <CheckedInFilter
          checkedIn={checkedIn}
          onChange={v => setFilters({...filters, checkedIn: v})}
        />
        <RegistrationStateFilter state={state} onChange={v => setFilters({...filters, state: v})} />
        <RegistrationTagsFilter
          tags={tags}
          onChange={v => setFilters({...filters, tags: v})}
          registrationTags={registrationTags}
        />
        <SortFilter sortBy={sortBy} onChange={v => setFilters({...filters, sortBy: v})} />
        <div className="mt-6 flex justify-between">
          <Button onClick={onClose} className="basis-full justify-center" variant="success">
            <CheckIcon className="h-5 w-5" />
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CheckedInFilter({
  checkedIn,
  onChange,
}: {
  checkedIn: CheckedInFilterData;
  onChange: (v: CheckedInFilterData) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <Typography variant="body3" className="font-semibold uppercase text-gray-500">
          Checked in
        </Typography>
      </div>
      <div className="flex flex-wrap gap-2">
        <FilterButton
          active={checkedIn.yes}
          onClick={() => onChange({...checkedIn, yes: !checkedIn.yes})}
        >
          Yes
        </FilterButton>
        <FilterButton
          active={checkedIn.no}
          onClick={() => onChange({...checkedIn, no: !checkedIn.no})}
        >
          No
        </FilterButton>
      </div>
    </div>
  );
}

export function RegistrationStateFilter({
  state,
  onChange,
}: {
  state: RegistrationStateFilterData;
  onChange: (v: RegistrationStateFilterData) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body3" className="font-semibold uppercase text-gray-500">
        Registration status
      </Typography>
      <div className="flex flex-wrap gap-2">
        {registrationStates.map(s => {
          const active = state[s as keyof RegistrationStateFilterData];
          return (
            <FilterButton
              key={s}
              active={active}
              onClick={() => onChange({...state, [s]: !active})}
            >
              {titleCase(s)}
            </FilterButton>
          );
        })}
      </div>
    </div>
  );
}

export function RegistrationTagsFilter({
  tags,
  onChange,
  registrationTags,
}: {
  tags: RegistrationTagsFilterData;
  onChange: (v: RegistrationTagsFilterData) => void;
  registrationTags: RegistrationTag[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body3" className="font-semibold uppercase text-gray-500">
        Tags
      </Typography>
      <div className="flex flex-wrap gap-2">
        {registrationTags.map(t => {
          const active = tags[t.title];
          return (
            <FilterButton
              key={t.id}
              active={active}
              onClick={() => onChange({...tags, [t.title]: !active})}
            >
              {t.color && (
                <div
                  className={`mr-2 h-3 w-3 rounded-full border border-gray-700 ${
                    tagColorClasses[t.color]
                  }`}
                />
              )}
              {t.title}
            </FilterButton>
          );
        })}
      </div>
    </div>
  );
}

export function SortFilter({
  sortBy,
  onChange,
}: {
  sortBy: SortFilterData;
  onChange: (v: SortFilterData) => void;
}) {
  const {key, ascending} = sortBy;
  const nameActive = key === 'fullName';
  const dateActive = key === 'registrationDate';

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body3" className="font-semibold uppercase text-gray-500">
        Sort by
      </Typography>
      <div className="flex flex-wrap gap-2">
        <SortButton
          active={nameActive}
          ascending={ascending}
          onClick={() => onChange({key: 'fullName', ascending: nameActive ? !ascending : true})}
        >
          Name
        </SortButton>
        <SortButton
          active={dateActive}
          ascending={ascending}
          onClick={() =>
            onChange({key: 'registrationDate', ascending: dateActive ? !ascending : true})
          }
        >
          Registration date
        </SortButton>
      </div>
    </div>
  );
}

export function ToggleFiltersButton({
  filtersVisible,
  defaultState,
  onClick,
}: {
  filtersVisible: boolean;
  defaultState: boolean;
  onClick: () => void;
}) {
  const commonClasses = `self-center rounded-full p-3 text-center text-sm font-medium focus:outline-none
                         active:bg-gray-300 dark:text-gray-400 dark:active:bg-gray-600`;
  const icon = defaultState ? (
    <FunnelIconOutline className="h-5 w-5" />
  ) : (
    <FunnelIcon className="h-5 w-5" />
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${commonClasses} ${
        filtersVisible ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'
      } text-gray-600`}
    >
      {icon}
    </button>
  );
}

export function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  if (active) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center rounded-full border border-transparent bg-blue-600 px-5 py-2.5 text-center
                   text-sm font-medium text-white focus:outline-none dark:bg-blue-700 dark:text-gray-200"
      >
        {children}
      </button>
    );
  } else {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium
                   text-gray-900 focus:outline-none dark:border-gray-900 dark:bg-gray-900 dark:text-gray-400"
      >
        {children}
      </button>
    );
  }
}

export function SortButton({
  active,
  ascending,
  onClick,
  children,
}: {
  active: boolean;
  ascending: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  if (active) {
    return (
      <button
        type="button"
        className="flex items-center gap-3 overflow-hidden rounded-full border border-transparent bg-blue-600
                   py-1 pl-5 pr-1 text-center text-sm font-medium text-white focus:outline-none dark:bg-blue-700
                   dark:text-gray-200"
        onClick={onClick}
      >
        {children}
        <ArrowUpIcon
          className={`h-8 w-8 rounded-full bg-white p-1.5 text-gray-700 transition-all dark:bg-gray-200 ${
            ascending ? '' : 'rotate-180'
          }`}
        />
      </button>
    );
  } else {
    return (
      <FilterButton active={active} onClick={onClick}>
        {children}
      </FilterButton>
    );
  }
}

export function ResultCount({count, onClick}: {count: number; onClick: () => void}) {
  const message = count === 1 ? '1 result' : `${count} results`; // i18n? never heard of it..

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 rounded-full bg-blue-600 py-2 pl-4 pr-3 text-gray-100
                   active:bg-blue-700 dark:bg-blue-700 dark:text-gray-200 dark:active:bg-blue-800"
      >
        <span className="whitespace-nowrap">{message}</span>
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
