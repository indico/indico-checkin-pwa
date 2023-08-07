import {CalendarIcon, UserCircleIcon} from '@heroicons/react/24/solid';
import IconFeather from '../Icons/Feather';

interface BreadcrumbsProps {
  routeNames: string[];
  routeHandlers?: Array<(() => void) | null>;
  className?: HTMLDivElement['className'];
}

export const Breadcrumbs = ({routeNames = [], routeHandlers = []}: BreadcrumbsProps) => {
  return (
    <div className="flex" aria-label="Breadcrumb">
      <ol className="flex flex-wrap gap-2 items-center">
        {routeNames.map((item, idx) => {
          const routeHandler: (() => void) | null =
            idx >= 0 && idx < routeHandlers.length ? routeHandlers[idx] : null;

          const children = (
            <>
              {idx === 0 && (
                <CalendarIcon className="w-5 h-5 min-w-[1.25rem] mr-0.5 text-primary" />
              )}
              {idx === 1 && <IconFeather className="w-5 h-5 min-w-[1.25rem] mr-0.5 text-primary" />}
              {idx === 2 && (
                <UserCircleIcon className="w-5 h-5 min-w-[1.25rem] mr-0.5 text-primary" />
              )}
              <span>{item}</span>
            </>
          );

          return (
            <li className="flex items-center" key={idx}>
              {routeHandler && (
                <button
                  onClick={routeHandler}
                  className="flex gap-1 text-sm font-medium text-gray-700 text-left hover:text-blue-600 dark:text-gray-400 dark:hover:text-white 
                  px-1.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
                >
                  {children}
                </button>
              )}
              {!routeHandler && (
                <div className="flex gap-1 items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {children}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
