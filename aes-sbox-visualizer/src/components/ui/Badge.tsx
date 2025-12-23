import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const variantStyles = {
  default: 'bg-[--color-cream-dark] text-[--color-ink]',
  success: 'bg-[--color-green] text-[--color-ink]',
  warning: 'bg-[--color-yellow] text-[--color-ink]',
  danger: 'bg-[--color-red] text-white',
  info: 'bg-[--color-blue] text-[--color-ink]',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-bold uppercase tracking-wide border-2 border-[--color-ink]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
