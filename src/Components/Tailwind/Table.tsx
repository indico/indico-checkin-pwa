import Typography from './Typography';

interface TableProps {
  columnLabels: string[];
  rows: string[][];
  className?: HTMLDivElement['className'];
}

const defaultParentClassName: HTMLDivElement['className'] =
  'relative sm:rounded-lg shadow-xl overflow-x-auto rounded-xl';

/**
 * Inspiration from: https://flowbite.com/docs/components/tables/#table-search
 * @param param0
 * @returns
 */
const Table = ({columnLabels, rows, className = ''}: TableProps) => {
  const parentClassName = defaultParentClassName + ' ' + className;

  return (
    <div className={parentClassName}>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 mt-2">
        <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-800 dark:text-gray-400">
          <tr>
            {columnLabels.map((label, idx) => (
              <th key={idx} scope="col" className="px-4 py-4 rounded-t-2xl">
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <div className="p-2 relative bg-gray-200 dark:bg-gray-800">
          <label htmlFor="table-search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
            <input
              type="text"
              id="table-search"
              className="block p-2 pl-4 text-sm text-gray-900 border border-gray-300 rounded-lg w-full bg-gray-50 active:ring-blue-500 active:border-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:active:ring-blue-500 dark:active:border-blue-500"
              placeholder="Type to search..."
            />
          </div>
        </div>

        <tbody>
          {rows.map((row, idx) => {
            const alternatingClass: HTMLElement['className'] =
              idx % 2 === 0 ? 'bg-gray-100 dark:bg-gray-900' : 'bg-gray-200 dark:bg-gray-800';
            const lastRowClass: HTMLElement['className'] =
              idx === rows.length - 1 ? 'rounded-b-xl' : '';

            return (
              <tr
                key={idx}
                className={`border-b ${alternatingClass} dark:border-gray-700 active:bg-gray-300 dark:active:bg-gray-600`}
              >
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className={`w-4 p-4 ${lastRowClass}`}>
                    <div className="flex items-center">
                      <Typography variant="body2">{cell}</Typography>
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
