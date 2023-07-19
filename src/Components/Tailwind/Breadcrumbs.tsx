import {CalendarIcon, ChevronRightIcon} from '@heroicons/react/24/solid';
import Typography from './Typography';

interface BreadcrumbsProps {
  routeNames: string[];
  routeLinks?: string[];
  className?: HTMLDivElement['className'];
}

const defaultParentClassName: HTMLDivElement['className'] = 'flex text-gray-700 items-center w-fit';

/* TODO: Make breadcrumps clickable */

export const Breadcrumbs = ({routeNames = [], routeLinks, className = ''}: BreadcrumbsProps) => {
  const parentClassName = defaultParentClassName + ' ' + className;

  return (
    <div className={parentClassName} aria-label="Breadcrumb">
      <CalendarIcon className="w-5 h-5 mr-1 text-primary" />

      <ol className="inline-flex items-center md:space-x-3">
        {routeNames.map((item, idx) => (
          <li className="inline-flex items-center" key={idx}>
            <>
              {idx > 0 && <ChevronRightIcon className="w-4 h-4 text-white" />}

              <Typography
                variant="body3"
                className="items-center text-gray-800 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white
              px-2 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
              >
                {item}
              </Typography>
            </>
          </li>
        ))}
      </ol>
    </div>
  );
};
