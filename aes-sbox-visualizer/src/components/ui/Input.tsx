import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="font-bold uppercase text-sm tracking-wide">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'brutal-border bg-white px-3 py-2 font-mono',
          'focus:outline-none focus:ring-2 focus:ring-[--color-ink] focus:ring-offset-2',
          'placeholder:text-gray-400',
          error && 'border-[--color-red] ring-[--color-red]',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-sm text-[--color-red] font-medium">{error}</span>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="font-bold uppercase text-sm tracking-wide">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'brutal-border bg-white px-3 py-2 font-mono min-h-[100px] resize-y',
          'focus:outline-none focus:ring-2 focus:ring-[--color-ink] focus:ring-offset-2',
          'placeholder:text-gray-400',
          error && 'border-[--color-red] ring-[--color-red]',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-sm text-[--color-red] font-medium">{error}</span>
      )}
    </div>
  );
}
