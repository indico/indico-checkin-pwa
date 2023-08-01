import {ComponentProps} from 'react';

interface BadgeProps {
  text: string;
  className?: ComponentProps<'div'>['className'];
  size?: 'sm' | 'md' | 'lg';
}

const defaultClassName: ComponentProps<'div'>['className'] =
  'bg-gray-200 text-darkSecondary dark:bg-gray-800 dark:text-secondary font-medium rounded border border-secondary';

const sizeClassNames: {
  sm: ComponentProps<'div'>['className'];
  md: ComponentProps<'div'>['className'];
  lg: ComponentProps<'div'>['className'];
} = {
  sm: 'text-xs px-2.5 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-lg px-2.5 py-1',
};

const Badge = ({text, className, size = 'md'}: BadgeProps) => {
  const fullClassname = `${defaultClassName} ${sizeClassNames[size]} ${className ?? ''}`;

  return <span className={fullClassname}>{text}</span>;
};

export default Badge;
