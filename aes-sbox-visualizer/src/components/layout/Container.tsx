import { cn } from '@/lib/utils';
import type { ReactNode, HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div className={cn('max-w-7xl mx-auto px-4', className)} {...props}>
      {children}
    </div>
  );
}
