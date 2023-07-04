import {ComponentProps} from 'react';

interface CheckboxProps {
  style: ComponentProps<'div'>['style'];
  checked: boolean;
  onChange: ComponentProps<'div'>['onChange'];
  className: ComponentProps<'div'>['className'];
}

const defaultCheckboxClasses: ComponentProps<'div'>['className'] =
  'w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800focus:ring-2 dark:bg-gray-700 dark:border-gray-600';
const Checkbox = ({style, checked, onChange, className}: CheckboxProps) => {
  const combinedClasses = defaultCheckboxClasses + ' ' + className;

  return (
    <div className="flex items-center">
      <input
        id="checkbox"
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={combinedClasses}
        style={style}
      />
    </div>
  );
};

export default Checkbox;
