import { cn } from '@/lib/utils';
import type { ReactNode, HTMLAttributes } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  variant?: 'default' | 'alt';
  children: ReactNode;
}

export function Section({
  title,
  description,
  variant = 'default',
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        'py-8',
        variant === 'alt' && 'bg-[--color-cream-dark]',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4">
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight border-b-4 border-[--color-ink] pb-2 inline-block">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-gray-600">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
