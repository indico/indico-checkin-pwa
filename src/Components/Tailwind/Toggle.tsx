import {CheckIcon} from '@heroicons/react/20/solid';
import {useIsOffline} from '../../utils/client';
import {LoadingIndicator} from './LoadingIndicator';

interface ToggleProps {
  className?: HTMLDivElement['className'];
  checked: boolean;
  onClick: () => void;
  rounded?: boolean;
  size?: 'xs' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

const dimensionsClassNames: {
  xs: HTMLDivElement['className'];
  md: HTMLDivElement['className'];
  lg: HTMLDivElement['className'];
  xl: HTMLDivElement['className'];
} = {
  xs: 'w-11 h-6 after:h-5 after:w-5 after:left-[2px] after:top-[2px] peer-checked:after:translate-x-full',
  md: 'w-16 h-8 after:h-7 after:w-7 after:left-[2px] after:top-[2px] peer-checked:after:translate-x-[110%]',
  lg: 'w-20 h-10 after:h-8 after:w-8 after:left-[8px] after:top-[4px] peer-checked:after:translate-x-full',
  xl: 'w-24 h-12 after:h-10 after:w-10 after:left-[8px] after:top-[4px] peer-checked:after:translate-x-full',
};

export const Toggle = ({
  checked = false,
  className,
  rounded = true,
  size = 'xs',
  onClick,
  disabled = false,
}: ToggleProps) => {
  const roundedProps: HTMLDivElement['className'] = rounded
    ? 'rounded-full after:rounded-full'
    : '';

  const dimensionsClassName = dimensionsClassNames[size];

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        value=""
        className="sr-only peer"
        checked={checked}
        onClick={onClick}
        onChange={e => e.stopPropagation()}
        disabled={disabled}
      />
      <div
        className={`bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
                    peer dark:bg-gray-500 after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border
                    after:transition-all dark:border-gray-600 peer-checked:after:border-white peer-checked:bg-blue-600
                    ${roundedProps} ${className} ${dimensionsClassName} ${
                      disabled ? 'opacity-50' : ''
                    }`}
      ></div>
    </label>
  );
};

interface CheckinToggleProps {
  checked: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export const CheckinToggle = ({checked, isLoading, onClick}: CheckinToggleProps) => {
  const offline = useIsOffline();

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        value=""
        className="sr-only peer"
        checked={checked}
        onClick={onClick}
        onChange={e => e.stopPropagation()}
        disabled={isLoading || offline}
      />
      <div
        className={`relative flex items-center px-5 rounded-full after:rounded-full bg-gray-200
                    w-44 h-16 after:h-14 after:w-14 after:left-[4px] after:top-[4px]
                    peer-checked:after:translate-x-[200%] peer-focus:outline-none peer-focus:ring-4
                    peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer dark:bg-gray-600
                    after:content-[''] after:absolute after:z-[3] after:bg-white dark:after:bg-gray-300
                    after:border-gray-300 after:border after:transition-all after:duration-[200ms]
                    dark:border-gray-600 peer-checked:after:border-0 peer-checked:bg-blue-600
                    peer-checked:after:bg-white dark:peer-checked:after:bg-gray-300 ${
                      isLoading ? 'opacity-70' : ''
                    }`}
      >
        <div className="relative flex w-full h-full">
          <div
            style={{
              transition: 'max-width 150ms',
              maxWidth: checked ? '11rem' : 0,
            }}
            className={`absolute z-[2] flex justify-start items-center left-0 right-0 bottom-[20%] top-[20%]
                        rounded-full whitespace-nowrap overflow-hidden ${
                          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
          >
            <span className="text-white dark:text-gray-200 pl-1">Checked in</span>
          </div>
          <div className="absolute z-[1] flex justify-end items-center left-0 right-0 bottom-[20%] top-[20%]">
            <span className="text-gray-800 dark:text-gray-200 pr-4">Check in</span>
          </div>
        </div>
      </div>
      <div
        style={{
          transition: !checked
            ? 'none'
            : 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="absolute z-10 left-[12px] top-[12px] opacity-0 peer-checked:opacity-100 peer-checked:translate-x-[280%]"
      >
        {!isLoading && <CheckIcon className="w-10 h-10 text-blue-600" />}
      </div>
      {isLoading && (
        <LoadingIndicator
          size="md"
          className={`absolute m-auto top-0 bottom-0 ${checked ? 'right-[12px]' : 'left-[12px]'}`}
        />
      )}
    </label>
  );
};
