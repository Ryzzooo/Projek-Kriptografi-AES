import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCryptoStore } from '@/store/useCryptoStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EXPECTED_SBOX44 } from '@/core/consts';

/**
 * 16x16 hex grid display for S-box visualization
 * Row = high nibble, Column = low nibble
 */
export function SBoxDisplay() {
  const { sbox, inverseSbox, isMatrixValid } = useCryptoStore();
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [showInverse, setShowInverse] = useState(false);

  const displayBox = showInverse ? inverseSbox : sbox;

  // Color gradient based on value (0-255 mapped to hue)
  const getCellColor = (value: number): string => {
    const hue = (value / 255) * 300; // 0 = red, 300 = magenta
    return `hsl(${hue}, 70%, 85%)`;
  };

  // Check if current S-box matches expected K44 S-box
  const matchesK44 = sbox.length === 256 &&
    sbox.every((val, idx) => val === EXPECTED_SBOX44[idx]);

  if (!isMatrixValid || sbox.length !== 256) {
    return (
      <Card variant="default" className="w-full">
        <CardHeader>
          <CardTitle>S-box</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center bg-[--color-cream-dark] border-2 border-dashed border-gray-400">
            <p className="text-gray-500 font-bold">
              Invalid matrix - cannot generate S-box
            </p>
            <p className="text-sm text-gray-400 mt-2">
              The affine matrix must be invertible to create a valid S-box
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="default" className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <CardTitle>{showInverse ? 'Inverse S-box' : 'S-box'}</CardTitle>
            {matchesK44 && !showInverse && (
              <span className="px-2 py-1 text-xs font-bold bg-[--color-green] border-2 border-[--color-ink]">
                MATCHES K44
              </span>
            )}
          </div>
          <button
            onClick={() => setShowInverse(!showInverse)}
            className={cn(
              'px-3 py-1 text-sm font-bold border-2 border-[--color-ink]',
              'hover:shadow-[2px_2px_0_var(--color-ink)] hover:-translate-x-0.5 hover:-translate-y-0.5',
              'transition-all duration-100',
              showInverse ? 'bg-[--color-purple] text-white' : 'bg-white'
            )}
          >
            {showInverse ? 'Show Forward' : 'Show Inverse'}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Hover info */}
        {hoveredCell !== null && (
          <div className="mb-3 p-2 bg-[--color-yellow] border-2 border-[--color-ink] font-mono text-sm flex gap-4">
            <span>
              <strong>Input:</strong> 0x{hoveredCell.toString(16).toUpperCase().padStart(2, '0')} ({hoveredCell})
            </span>
            <span>
              <strong>Output:</strong> 0x{displayBox[hoveredCell].toString(16).toUpperCase().padStart(2, '0')} ({displayBox[hoveredCell]})
            </span>
            <span>
              <strong>Binary:</strong> {displayBox[hoveredCell].toString(2).padStart(8, '0')}
            </span>
          </div>
        )}

        {/* S-box grid */}
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Header row */}
            <div className="flex">
              <div className="w-10 h-8 flex items-center justify-center font-mono font-bold text-sm bg-[--color-ink] text-white border border-[--color-ink]">

              </div>
              {Array.from({ length: 16 }).map((_, col) => (
                <div
                  key={col}
                  className="w-10 h-8 flex items-center justify-center font-mono font-bold text-sm bg-[--color-ink] text-white border border-[--color-ink]"
                >
                  {col.toString(16).toUpperCase()}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {Array.from({ length: 16 }).map((_, row) => (
              <div key={row} className="flex">
                {/* Row header */}
                <div className="w-10 h-8 flex items-center justify-center font-mono font-bold text-sm bg-[--color-ink] text-white border border-[--color-ink]">
                  {row.toString(16).toUpperCase()}
                </div>

                {/* Cells */}
                {Array.from({ length: 16 }).map((_, col) => {
                  const index = (row << 4) | col;
                  const value = displayBox[index];
                  const isHovered = hoveredCell === index;

                  return (
                    <div
                      key={col}
                      onMouseEnter={() => setHoveredCell(index)}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{ backgroundColor: getCellColor(value) }}
                      className={cn(
                        'w-10 h-8 flex items-center justify-center font-mono text-xs border border-[--color-ink]',
                        'cursor-default transition-all duration-100',
                        isHovered && 'ring-2 ring-[--color-ink] ring-offset-1 z-10'
                      )}
                    >
                      {value.toString(16).toUpperCase().padStart(2, '0')}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="font-bold">Value gradient:</span>
          <div className="flex items-center gap-1">
            <div
              className="w-6 h-4 border border-[--color-ink]"
              style={{ backgroundColor: getCellColor(0) }}
            />
            <span className="font-mono">00</span>
          </div>
          <div className="w-32 h-4 border border-[--color-ink]" style={{
            background: 'linear-gradient(to right, hsl(0, 70%, 85%), hsl(150, 70%, 85%), hsl(300, 70%, 85%))'
          }} />
          <div className="flex items-center gap-1">
            <div
              className="w-6 h-4 border border-[--color-ink]"
              style={{ backgroundColor: getCellColor(255) }}
            />
            <span className="font-mono">FF</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
