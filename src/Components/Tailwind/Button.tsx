import {ComponentProps, ReactNode} from 'react';

interface ButtonProps {
  children: ReactNode;
  className?: ComponentProps<'div'>['className'];
  onClick: () => void;
}

const defaultBtnClassName: ComponentProps<'div'>['className'] =
  'text-white bg-primary active:opacity-50 font-medium rounded-lg text-sm px-4 h-fit py-3 justify-self-center ease-linear transition-all duration-150';

const Button = ({children, className, onClick}: ButtonProps) => {
  const fullClassname = defaultBtnClassName + ' ' + (className ?? '');

  return (
    <button type="button" className={fullClassname} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
