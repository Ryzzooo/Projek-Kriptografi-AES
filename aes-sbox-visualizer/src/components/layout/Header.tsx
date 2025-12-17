import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn('bg-[--color-yellow] border-b-4 border-[--color-ink]', className)}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
          AES S-box Visualizer
        </h1>
        <p className="mt-2 text-lg font-medium">
          Interactive visualization of AES S-box modification using affine matrices
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="https://doi.org/10.1088/1742-6596/1751/1/012033"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 text-sm font-bold bg-white border-2 border-[--color-ink] hover:shadow-[2px_2px_0_var(--color-ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            Research Paper &rarr;
          </a>
          <span className="px-3 py-1 text-sm font-mono bg-[--color-ink] text-white">
            Alamsyah et al. (2020)
          </span>
        </div>
      </div>
    </header>
  );
}
