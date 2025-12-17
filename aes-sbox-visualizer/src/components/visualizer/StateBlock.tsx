import { cn } from '@/lib/utils';
import type { State } from '@/core/aes';

interface StateBlockProps {
  state: State;
  title?: string;
  variant?: 'default' | 'input' | 'subBytes' | 'shiftRows' | 'mixColumns' | 'addRoundKey' | 'output';
  highlightChanges?: State | null;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-white',
  input: 'bg-[--color-cream]',
  subBytes: 'bg-[--color-yellow]',
  shiftRows: 'bg-[--color-blue]',
  mixColumns: 'bg-[--color-purple]',
  addRoundKey: 'bg-[--color-green]',
  output: 'bg-[--color-red] text-white',
};

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

/**
 * 4x4 AES state block visualization
 */
export function StateBlock({
  state,
  title,
  variant = 'default',
  highlightChanges,
  size = 'md',
}: StateBlockProps) {
  // Check if a cell changed compared to previous state
  const didChange = (row: number, col: number): boolean => {
    if (!highlightChanges) return false;
    return state[row][col] !== highlightChanges[row][col];
  };

  return (
    <div className="inline-flex flex-col items-center">
      {title && (
        <div className={cn(
          'mb-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wide border-2 border-[--color-ink]',
          variantStyles[variant]
        )}>
          {title}
        </div>
      )}
      <div className={cn(
        'border-2 border-[--color-ink] p-1',
        variantStyles[variant]
      )}>
        <div className="grid grid-cols-4 gap-0.5">
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 4 }).map((_, col) => {
              const value = state[row][col];
              const changed = didChange(row, col);

              return (
                <div
                  key={`${row}-${col}`}
                  className={cn(
                    'font-mono font-bold flex items-center justify-center',
                    'border border-[--color-ink]',
                    sizeStyles[size],
                    changed
                      ? 'bg-[--color-orange] text-white ring-2 ring-[--color-ink]'
                      : 'bg-white/50'
                  )}
                >
                  {value.toString(16).toUpperCase().padStart(2, '0')}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

interface StateBlockRowProps {
  states: {
    state: State;
    title: string;
    variant: StateBlockProps['variant'];
  }[];
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Horizontal row of state blocks with arrows
 */
export function StateBlockRow({ states, size = 'md' }: StateBlockRowProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {states.map((block, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && (
            <div className="text-2xl font-bold text-[--color-ink]">&rarr;</div>
          )}
          <StateBlock
            state={block.state}
            title={block.title}
            variant={block.variant}
            size={size}
          />
        </div>
      ))}
    </div>
  );
}
