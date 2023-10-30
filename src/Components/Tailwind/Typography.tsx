import {ComponentProps, ReactNode, createElement} from 'react';
import {twMerge} from 'tailwind-merge';

interface variantProps {
  h1: ComponentProps<'div'>['className'];
  h2: ComponentProps<'div'>['className'];
  h3: ComponentProps<'div'>['className'];
  h4: ComponentProps<'div'>['className'];
  body1: ComponentProps<'div'>['className'];
  body2: ComponentProps<'div'>['className'];
  body3: ComponentProps<'div'>['className'];
}
/**
 * Map of variants to tailwind classes
 */
const variants: variantProps = {
  h1: 'text-4xl text-gray-800 dark:text-gray-300',
  h2: 'text-2xl text-gray-800 dark:text-gray-300',
  h3: 'text-xl text-gray-800 dark:text-gray-300',
  h4: 'text-lg text-gray-800 dark:text-gray-300',
  body1: 'text-base text-gray-800 dark:text-gray-300',
  body2: 'text-sm text-gray-800 dark:text-gray-300',
  body3: 'text-xs text-gray-700 dark:text-gray-400',
};

interface TypographyProps {
  as?: 'p' | 'div';
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'body3';
  children: ReactNode;
  className?: ComponentProps<'div'>['className'];
}

const Typography = ({as = 'p', variant, children, className}: TypographyProps) => {
  const variantClass = twMerge(variants[variant], className); // Merge the variant class with the className prop
  return createElement(as, {className: variantClass}, children);
};

export default Typography;
