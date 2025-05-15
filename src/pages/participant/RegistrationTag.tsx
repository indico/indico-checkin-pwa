import {RegistrationTag as _RegistrationTag} from '../../db/db';

export function RegistrationTag({tag}: {tag: _RegistrationTag | string}) {
  let title: string, color: string, colorClasses: string;
  if (typeof tag === 'string') {
    title = tag;
    color = 'grey';
  } else {
    title = tag.title;
    color = tag.color || 'grey';
  }
  /**
   * We must translate the SUI color to Tailwind CSS classes. Class names must be fully
   * specified, because Tailwind does not support dynamic class names.
   * https://tailwindcss.com/docs/detecting-classes-in-source-files#dynamic-class-names
   */
  switch (color) {
    case 'red':
      colorClasses = 'border-red-700 text-red-700 dark:border-red-400 dark:text-red-400';
      break;
    case 'green':
      colorClasses = 'border-green-800 text-green-800 dark:border-green-400 dark:text-green-400';
      break;
    case 'blue':
      colorClasses = 'border-blue-800 text-blue-800 dark:border-blue-400 dark:text-blue-400';
      break;
    case 'yellow':
      colorClasses =
        'border-yellow-500 text-yellow-500 dark:border-yellow-400 dark:text-yellow-400';
      break;
    case 'purple':
      colorClasses =
        'border-purple-700 text-purple-700 dark:border-purple-400 dark:text-purple-400';
      break;
    case 'pink':
      colorClasses = 'border-pink-700 text-pink-700 dark:border-pink-400 dark:text-pink-400';
      break;
    case 'orange':
      colorClasses =
        'border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400';
      break;
    case 'violet':
      colorClasses =
        'border-violet-700 text-violet-700 dark:border-violet-400 dark:text-violet-400';
      break;
    case 'teal':
      colorClasses = 'border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400';
      break;
    case 'olive':
      colorClasses = 'border-lime-700 text-lime-700 dark:border-lime-300 dark:text-lime-300';
      break;
    case 'brown':
      colorClasses = 'border-amber-700 text-amber-700 dark:border-amber-600 dark:text-amber-600';
      break;
    case 'black':
      colorClasses = 'border-stone-800 text-stone-800 dark:border-stone-700 dark:text-stone-100';
      break;
    default:
      colorClasses = 'border-gray-700 text-gray-700 dark:border-gray-400 dark:text-gray-400';
      break;
  }

  return (
    <span
      className={`white-space-nowrap w-fit overflow-hidden truncate rounded-full border
                  px-2.5 py-1 text-sm font-medium ${colorClasses}`}
      style={{maxWidth: '80vw'}}
    >
      {title}
    </span>
  );
}
