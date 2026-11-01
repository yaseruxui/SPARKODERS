import { cva, type VariantProps } from 'class-variance-authority';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-[0.6em] rounded-full border border-transparent font-display font-semibold transition-[translate,scale,box-shadow,background-color,border-color,background-position] duration-350 ease-brand active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
  {
    variants: {
      variant: {
        grad: 'bg-grad bg-size-[160%_100%] text-white shadow-[0_10px_30px_-12px_rgb(178_108_255/0.7)] hover:-translate-y-0.5 hover:bg-position-[100%_0] hover:shadow-[0_16px_40px_-14px_rgb(127_238_250/0.6)]',
        ghost: 'border-line-strong bg-glass hover:border-aqua',
        light: 'bg-text text-ink hover:bg-aqua',
      },
      size: {
        sm: 'min-h-10 px-[1.15em] py-[0.45em] text-sm has-[svg]:pe-[calc(1.15em-2px)]',
        md: 'min-h-12 px-[1.5em] py-[0.7em] text-[0.95rem] has-[svg]:pe-[calc(1.5em-2px)]',
      },
    },
    defaultVariants: { variant: 'grad', size: 'md' },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & Variants) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

/** Same look as `Button`, for in-page anchors and external links. */
export function ButtonLink({ className, variant, size, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & Variants) {
  return <a className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
