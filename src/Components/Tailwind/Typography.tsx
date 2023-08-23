import {ComponentProps, ReactNode} from 'react';
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
  h1: 'text-5xl text-black dark:text-gray-300',
  h2: 'text-3xl text-black dark:text-gray-300',
  h3: 'text-xl text-black dark:text-gray-300',
  h4: 'text-lg text-black dark:text-gray-300',
  body1: 'text-base text-black dark:text-gray-300',
  body2: 'text-sm text-black dark:text-gray-300',
  body3: 'text-xs text-black dark:text-gray-300',
};

interface TypographyProps {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'body3';
  children: ReactNode;
  className?: ComponentProps<'div'>['className'];
}

const Typography = ({variant, children, className}: TypographyProps) => {
  const variantClass = twMerge(variants[variant], className); // Merge the variant class with the className prop

  return <p className={variantClass}>{children}</p>;
};

export default Typography;
