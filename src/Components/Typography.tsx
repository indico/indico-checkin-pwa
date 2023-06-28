import { ComponentProps } from "react";

interface variantProps {
    h1: ComponentProps<'div'>["className"];
    h2: ComponentProps<'div'>["className"];
    h3: ComponentProps<'div'>["className"];
    h4: ComponentProps<'div'>["className"];
    body1: ComponentProps<'div'>["className"];
    body2: ComponentProps<'div'>["className"];
    body3: ComponentProps<'div'>["className"];
}
/**
 * Map of variants to tailwind classes
 */
const variants : variantProps = {
    h1: "text-5xl text-white",
    h2: "text-3xl text-white",
    h3: "text-xl text-white",
    h4: "text-lg text-white",
    body1: "text-base text-white",
    body2: "text-sm text-white",
    body3: "text-xs text-white",
}

interface TypographyProps {
    variant: "h1" | "h2" | "h3" | "h4" | "body1" | "body2" | "body3";
    children: string;
    className: ComponentProps<'div'>["className"];
};

const Typography = ({variant, children, className} : TypographyProps) => {
    const variantClass = variants[variant] + " " + className;

    return (
        <p className={variantClass}>{children}</p>
    );
};

export default Typography;