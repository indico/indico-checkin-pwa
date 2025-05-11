import {RegistrationTag as _RegistrationTag} from '../../db/db';

export function RegistrationTag({tag}: {tag: _RegistrationTag | string}) {
  let title: string, color: string, colorClasses: string;
  if (typeof tag === 'string') {
    title = tag;
    color = 'gray';
  } else {
    title = tag.title;
    color = tag.color;
  }
  /**
   * We must translate the SUI color to Tailwind CSS classes. Class names must be fully
   * specified, because Tailwind does not support dynamic class names.
   * https://tailwindcss.com/docs/detecting-classes-in-source-files#dynamic-class-names
   */
  switch (color) {
    case 'red':
      colorClasses =
        'bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100';
      break;
    case 'green':
      colorClasses =
        'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100';
      break;
    case 'blue':
      colorClasses =
        'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100';
      break;
    case 'yellow':
      colorClasses =
        'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-300 dark:border-yellow-900 dark:text-yellow-900';
      break;
    case 'purple':
      colorClasses =
        'bg-purple-100 border-purple-200 text-purple-800 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-100';
      break;
    case 'pink':
      colorClasses =
        'bg-pink-100 border-pink-200 text-pink-800 dark:bg-pink-900 dark:border-pink-700 dark:text-pink-100';
      break;
    case 'orange':
      colorClasses =
        'bg-orange-100 border-orange-200 text-orange-800 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100';
      break;
    case 'violet':
      colorClasses =
        'bg-violet-100 border-violet-200 text-violet-800 dark:bg-violet-900 dark:border-violet-700 dark:text-violet-100';
      break;
    case 'teal':
      colorClasses =
        'bg-teal-100 border-teal-200 text-teal-800 dark:bg-teal-900 dark:border-teal-700 dark:text-teal-100';
      break;
    case 'olive':
      colorClasses =
        'bg-lime-100 border-lime-200 text-lime-800 dark:bg-lime-200 dark:border-lime-700 dark:text-lime-950';
      break;
    case 'brown':
      colorClasses =
        'bg-yellow-700 border-yellow-900 text-orange-50 dark:bg-amber-950 dark:border-amber-900 dark:text-orange-100';
      break;
    case 'black':
      colorClasses =
        'bg-stone-600 border-stone-800 text-stone-100 dark:bg-stone-900 dark:border-stone-700 dark:text-stone-100';
      break;
    default:
      colorClasses =
        'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100';
      break;
  }

  return (
    <span
      className={`white-space-nowrap font-medißum w-fit overflow-hidden truncate rounded-full
                  border-2 px-2.5 py-1 text-sm ${colorClasses}`}
      style={{maxWidth: '80vw'}}
    >
      {title}
    </span>
  );
}
