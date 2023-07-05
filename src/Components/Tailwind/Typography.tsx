import {ComponentProps, ReactNode} from 'react';

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
  h1: 'text-5xl text-black dark:text-white',
  h2: 'text-3xl text-black dark:text-white',
  h3: 'text-xl text-black dark:text-white',
  h4: 'text-lg text-black dark:text-white',
  body1: 'text-base text-black dark:text-white',
  body2: 'text-sm text-black dark:text-white',
  body3: 'text-xs text-black dark:text-white',
};

interface TypographyProps {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'body3';
  children: ReactNode;
  className?: ComponentProps<'div'>['className'];
}

const Typography = ({variant, children, className}: TypographyProps) => {
  const variantClass = variants[variant] + ' ' + (className ?? '');

  return <p className={variantClass}>{children}</p>;
};

export default Typography;
