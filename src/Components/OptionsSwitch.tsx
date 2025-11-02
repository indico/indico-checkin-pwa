import Typography from './Tailwind/Typography';

export interface SwitchOption<T extends string> {
  value: T;
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
  label: string;
}

interface OptionsSwitchProps<T extends string> {
  title: string;
  description?: string;
  value: T;
  options: SwitchOption<T>[];
  onChange: (value: T) => void;
}

export function OptionsSwitch<T extends string>({
  title,
  description,
  value,
  options,
  onChange,
}: OptionsSwitchProps<T>) {
  const activeIndex = options.findIndex(opt => opt.value === value);

  return (
    <div className="flex flex-col">
      <Typography variant="h4">{title}</Typography>
      {description && <Typography variant="body2">{description}</Typography>}
      <div className="relative my-2 inline-flex w-full gap-1.5 rounded-xl bg-gray-200 p-1 dark:bg-gray-700">
        <div
          className="absolute top-1 h-[calc(100%-0.5rem)] rounded-lg bg-white shadow-md transition-all duration-300 ease-in-out dark:bg-gray-800"
          style={{
            width: `calc(${100 / options.length}% - 0.5rem)`,
            left: `calc(${activeIndex * (100 / options.length)}% + 0.25rem)`,
          }}
        />
        {options.map(({value: optValue, icon: Icon, label}) => {
          const isActive = value === optValue;
          return (
            <button
              key={optValue}
              onClick={() => onChange(optValue)}
              className={`relative z-10 flex flex-1 flex-col items-center justify-center gap-1.5 rounded-lg py-3 transition-colors duration-300 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-6 w-6" />
              <Typography variant="body2" className="font-medium">
                {label}
              </Typography>
            </button>
          );
        })}
      </div>
    </div>
  );
}
