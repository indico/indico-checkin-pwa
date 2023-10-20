import {InformationCircleIcon} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';
import {AccompanyingPersonsFieldData} from './fields';

export default function AccompanyingPersons({persons}: {persons: AccompanyingPersonsFieldData[]}) {
  return (
    <div
      className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-gray-800 dark:text-blue-400"
      role="alert"
    >
      <div className="flex items-center gap-2">
        <InformationCircleIcon className="h-5 w-5 min-w-[1.25rem]" />
        <span className="sr-only">Info</span>
        {persons.length === 1 && (
          <div>There is one additional accompanying person for this registration:</div>
        )}
        {persons.length > 1 && (
          <div>
            There are {persons.length} additional accompanying persons for this registration:
          </div>
        )}
      </div>
      <div className="ml-8 mt-4">
        <PersonList persons={persons} />
      </div>
    </div>
  );
}

function PersonList({persons}: {persons: AccompanyingPersonsFieldData[]}) {
  return (
    <ul className="list-inside list-disc space-y-1 text-gray-500 dark:text-gray-400">
      {persons.map(({id, firstName, lastName}) => (
        <li key={id}>
          <Typography variant="body1" className="inline">
            {firstName} {lastName}
          </Typography>
        </li>
      ))}
    </ul>
  );
}
