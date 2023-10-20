import {RegistrationState as _RegistrationState} from '../../db/db';

export function RegistrationState({state}: {state: _RegistrationState}) {
  let color;

  switch (state) {
    case 'complete':
      color = 'green';
      break;
    case 'pending':
    case 'unpaid':
      color = 'yellow';
      break;
    case 'rejected':
    case 'withdrawn':
      color = 'red';
      break;
  }

  return (
    <span
      className={`w-fit rounded-full bg-${color}-100 px-2.5 py-1 text-sm font-medium
                  text-${color}-800 dark:bg-${color}-900 dark:text-${color}-300`}
    >
      {state}
    </span>
  );
}
