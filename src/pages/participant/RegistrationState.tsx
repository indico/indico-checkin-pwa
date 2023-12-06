import {RegistrationState as _RegistrationState} from '../../db/db';

export function RegistrationState({state}: {state: _RegistrationState}) {
  let color;
  let text: string = state;

  switch (state) {
    case 'complete':
      color = 'green';
      break;
    case 'pending':
      color = 'yellow';
      text = 'pending approval';
      break;
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
      Registration {text}
    </span>
  );
}
