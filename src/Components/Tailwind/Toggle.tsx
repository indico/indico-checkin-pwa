import {CheckIcon} from '@heroicons/react/20/solid';
import {LoadingIndicator} from './LoadingIndicator';

interface ToggleProps {
  className?: HTMLDivElement['className'];
  checked: boolean;
  onChange?: () => void;
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
  onChange = () => {},
  disabled = false,
}: ToggleProps) => {
  const roundedProps: HTMLDivElement['className'] = rounded
    ? 'rounded-full after:rounded-full'
    : '';

  const dimensionsClassName = dimensionsClassNames[size];

  return (
    <label
      style={{WebkitTapHighlightColor: 'transparent'}}
      className="relative inline-flex cursor-pointer items-center"
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
        onClick={e => e.stopPropagation()}
        disabled={disabled}
      />
      <div
        className={`peer bg-gray-200 after:absolute after:border after:border-gray-300
                    after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600
                    peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-500
                    ${roundedProps} ${className} ${dimensionsClassName} ${
                      disabled ? 'opacity-50' : ''
                    }`}
      ></div>
    </label>
  );
};

interface CheckInStateToggleProps {
  checked: boolean;
  isLoading: boolean;
  checkInState: string;
  label: string;
  onClick: () => void;
}

export const CheckInStateToggle = ({
  checked,
  isLoading,
  checkInState,
  label,
  onClick,
}: CheckInStateToggleProps) => {
  return (
    <label
      style={{WebkitTapHighlightColor: 'transparent'}}
      className="relative inline-flex cursor-pointer items-center"
    >
      <input
        type="checkbox"
        value=""
        className="peer sr-only"
        checked={checked}
        onClick={onClick}
        onChange={e => e.stopPropagation()}
        disabled={isLoading}
      />
      <div
        className={`peer relative flex h-16 w-44 items-center rounded-full
                    bg-gray-200 px-3 after:absolute after:left-[4px] after:top-[4px] after:z-[3]
                    after:h-14 after:w-14 after:rounded-full
                    after:border after:border-gray-300 after:bg-white after:transition-all
                    after:duration-[200ms] after:content-[''] peer-checked:bg-blue-600
                    peer-checked:after:translate-x-[200%] peer-checked:after:border-0
                    peer-checked:after:bg-white peer-focus:outline-none
                    dark:border-gray-600 dark:bg-gray-600 dark:after:bg-gray-300
                    dark:peer-checked:after:bg-gray-300 dark:peer-focus:ring-blue-800 ${
                      isLoading ? 'opacity-70' : ''
                    }`}
      >
        <div className="relative flex h-full w-full">
          <div
            style={{
              transition: 'max-width 150ms',
              maxWidth: checked ? '11rem' : 0,
            }}
            className={`absolute bottom-[20%] left-0 right-0 top-[20%] z-[2] flex items-center justify-start
                        overflow-hidden whitespace-nowrap rounded-full ${
                          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
          >
            <span className="pl-1 text-white dark:text-gray-200">{checkInState}</span>
          </div>
          <div className="absolute bottom-[20%] left-0 right-0 top-[20%] z-[1] flex items-center justify-end">
            <span className="pr-4 text-gray-800 dark:text-gray-200">{label}</span>
          </div>
        </div>
      </div>
      <div
        style={{
          transition: !checked
            ? 'none'
            : 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="absolute left-[12px] top-[12px] z-10 opacity-0 peer-checked:translate-x-[280%]
                   peer-checked:opacity-100"
      >
        {!isLoading && <CheckIcon className="h-10 w-10 text-blue-600" />}
      </div>
      {isLoading && (
        <LoadingIndicator
          size="md"
          className={`absolute bottom-0 top-0 m-auto ${checked ? 'right-[12px]' : 'left-[12px]'}`}
        />
      )}
    </label>
  );
};
