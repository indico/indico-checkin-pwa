interface ToggleProps {
  className?: HTMLDivElement['className'];
  checked: boolean;
  onClick: () => void;
  rounded?: boolean;
}

export const Toggle = ({checked = false, className, rounded = true, onClick}: ToggleProps) => {
  const roundedProps: HTMLDivElement['className'] = rounded
    ? 'rounded-full after:rounded-full'
    : '';

  const scale = 2;

  const dimensions = {
    width: 11 * scale,
    height: 6 * scale,
    afterWidth: 5 * scale,
    afterHeight: 5 * scale,
    afterTop: 2 * scale,
    afterLeft: 2 * scale,
  };
  const dimensionsClassNames: HTMLDivElement['className'] = `w-[${dimensions.width}px] h-[${dimensions.height}px] after:w-[${dimensions.afterWidth}px] \
   after:h-[${dimensions.afterHeight}px] after:top-[${dimensions.afterTop}px] after:left-[${dimensions.afterLeft}px]`;

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        value=""
        className="sr-only peer"
        checked={checked}
        onClick={onClick}
        onChange={e => e.stopPropagation()}
      />
      <div
        className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 \
       peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] \
      after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border \
      after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${roundedProps} ${className} ${dimensionsClassNames}}`}
      ></div>
    </label>
  );
};
