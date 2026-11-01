import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export const controlClass =
  'min-h-12 w-full rounded-xl border border-line-strong bg-ink px-4 py-3 outline-none transition-[border-color,box-shadow] duration-250 placeholder:text-faint rtl:[&[dir=ltr]]:text-right focus:border-aqua focus:shadow-[0_0_0_3px_rgb(127_238_250/0.15)] aria-invalid:border-danger-line';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, 'resize-y', className)} {...props} />;
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm text-muted', className)} {...props} />;
}
