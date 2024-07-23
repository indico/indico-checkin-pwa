import {ComponentProps, ReactNode, MouseEvent} from 'react';

interface ButtonProps {
  children: ReactNode;
  className?: ComponentProps<'div'>['className'];
  variant?: 'default' | 'success' | 'warning';
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

const variants = {
  default: `bg-primary hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600
            dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800`,
  success: `bg-green-500 active:bg-green-600 dark:bg-green-600 dark:active:bg-green-700 focus:outline-none`,
  warning: `bg-yellow-500 active:bg-yellow-600 dark:bg-yellow-600 dark:active:bg-yellow-700 focus:outline-none`,
};

const defaultBtnClassName: ComponentProps<'div'>['className'] = `
  flex gap-2 text-white font-medium rounded-lg
  text-sm px-4 h-fit py-3 justify-self-center`;

const Button = ({children, variant, className, onClick}: ButtonProps) => {
  const color = variants[variant || 'default'];
  const fullClassname = `${defaultBtnClassName} ${color} ${className}`;

  return (
    <button type="button" className={fullClassname} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;

const defaultDangerBtnClassName: ComponentProps<'div'>['className'] = `
  flex gap-2 justify-center text-white bg-red-500 font-medium rounded-lg text-sm px-4 h-fit py-3 justify-self-center
  active:bg-red-600 dark:bg-red-700 dark:active:bg-red-800`;

export const DangerButton = ({children, className, onClick}: ButtonProps) => {
  const fullClassname = defaultDangerBtnClassName + ' ' + (className || '');

  return (
    <button type="button" className={fullClassname} onClick={onClick}>
      {children}
    </button>
  );
};

const defaultSimpleBtnClassName: ComponentProps<'div'>['className'] = `
  flex items-center gap-2 text-gray-800 dark:text-gray-300 text-base rounded-lg pl-2
  h-fit py-1 justify-self-center focus:ring-4 focus:ring-blue-300 focus:outline-none
  dark:focus:ring-blue-800`;

export const SimpleButton = ({children, className, onClick}: ButtonProps) => {
  const fullClassname = defaultSimpleBtnClassName + ' ' + (className || '');

  return (
    <button type="button" className={fullClassname} onClick={onClick}>
      {children}
    </button>
  );
};

const defaultOultineBtnClassName: ComponentProps<'div'>['className'] = `
  py-3 px-3 text-sm font-medium text-gray-900 bg-white rounded-lg
  border border-gray-200 active:bg-gray-100 active:text-blue-700
  dark:bg-gray-800 dark:text-gray-100 dark:border-gray-500
  dark:active:text-blue-300 dark:active:bg-gray-700`;

export const OutlineButton = ({children, className, onClick}: ButtonProps) => {
  const fullClassname = `${defaultOultineBtnClassName} ${className}`;

  return (
    <button type="button" className={fullClassname} onClick={onClick}>
      {children}
    </button>
  );
};
