import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-[--color-yellow] hover:bg-[--color-orange]',
  secondary: 'bg-white hover:bg-[--color-cream-dark]',
  danger: 'bg-[--color-red] hover:bg-red-600 text-[--color-ink]',
  success: 'bg-[--color-green] hover:bg-green-600',
};

const sizeStyles = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'brutal-btn font-bold uppercase tracking-wide',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-[4px_4px_0_var(--color-ink)]',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
