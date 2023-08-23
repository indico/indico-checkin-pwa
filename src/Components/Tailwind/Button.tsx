import {ComponentProps, ReactNode} from 'react';

interface ButtonProps {
  children: ReactNode;
  className?: ComponentProps<'div'>['className'];
  onClick: () => void;
}

const defaultBtnClassName: ComponentProps<'div'>['className'] = `flex gap-2 text-white bg-primary font-medium rounded-lg text-sm px-4 h-fit py-3 justify-self-center
   hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700
   focus:outline-none dark:focus:ring-blue-800`;

const Button = ({children, className, onClick}: ButtonProps) => {
  const fullClassname = defaultBtnClassName + ' ' + (className ?? '');

  return (
    <button type="button" className={fullClassname} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
