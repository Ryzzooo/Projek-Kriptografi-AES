import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'yellow' | 'blue' | 'purple' | 'green' | 'red';
  shadow?: boolean;
  children: ReactNode;
}

const variantStyles = {
  default: 'bg-white',
  yellow: 'bg-[--color-yellow]',
  blue: 'bg-[--color-blue]',
  purple: 'bg-[--color-purple]',
  green: 'bg-[--color-green]',
  red: 'bg-[--color-red]',
};

export function Card({
  variant = 'default',
  shadow = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'brutal-border p-4',
        variantStyles[variant],
        shadow && 'brutal-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn('text-xl font-bold uppercase tracking-wide', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}
