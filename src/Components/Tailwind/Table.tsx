import Typography from './Typography';

interface TableProps {
  columnLabels: string[];
  rows: string[][];
  className?: HTMLDivElement['className'];
}

const defaultParentClassName: HTMLDivElement['className'] = 'relative sm:rounded-lg';

/**
 * Inspiration from: https://flowbite.com/docs/components/tables/#table-search
 * @param param0
 * @returns
 */
const Table = ({columnLabels, rows, className = ''}: TableProps) => {
  const parentClassName = defaultParentClassName + ' ' + className;

  return (
    <div className={parentClassName}>
      <div className="p-2 relative rounded-xl shadow-md overflow-x-auto">
        <label htmlFor="table-search" className="sr-only">
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
          <input
            type="text"
            id="table-search"
            className="block p-2 pl-4 text-sm text-gray-900 border border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search for items"
          />
        </div>
      </div>

      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 mt-2 shadow-xl overflow-x-auto">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {columnLabels.map((label, idx) => (
              <th key={idx} scope="col" className="px-4 py-4">
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="w-4 p-4">
                  <div className="flex items-center">
                    <Typography variant="body2">{cell}</Typography>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
