import {ComponentProps} from 'react';

interface BadgeProps {
  text: string;
  className?: ComponentProps<'div'>['className'];
  colorClassName?: ComponentProps<'div'>['className'];
  size?: 'sm' | 'md' | 'lg';
}

const defaultClassName: ComponentProps<'div'>['className'] =
  'bg-gray-200 dark:bg-gray-800 font-medium rounded border';

const defaultColorClass: ComponentProps<'div'>['className'] =
  'text-darkSecondary dark:text-secondary border-secondary';

const sizeClassNames: {
  sm: ComponentProps<'div'>['className'];
  md: ComponentProps<'div'>['className'];
  lg: ComponentProps<'div'>['className'];
} = {
  sm: 'text-xs px-2.5 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-lg px-2.5 py-1',
};

const Badge = ({text, className, size = 'md', colorClassName = defaultColorClass}: BadgeProps) => {
  const fullClassname = `${defaultClassName} ${colorClassName} ${sizeClassNames[size]} ${
    className ?? ''
  }`;

  return <span className={fullClassname}>{text}</span>;
};

export default Badge;
