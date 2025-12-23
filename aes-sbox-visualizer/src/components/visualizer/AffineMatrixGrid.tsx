import { cn } from '@/lib/utils';
import { useCryptoStore } from '@/store/useCryptoStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { MatrixPreset } from '@/core/consts';

/**
 * Interactive 8x8 binary matrix editor for the affine transformation
 * Each row is stored as a byte (LSB to MSB)
 */
export function AffineMatrixGrid() {
  const {
    affineMatrix,
    constant,
    isMatrixValid,
    toggleMatrixBit,
    setConstant,
    loadPreset,
    randomizeMatrix,
    clearMatrix,
  } = useCryptoStore();

  // Get bit value at position
  const getBit = (row: number, col: number): boolean => {
    return ((affineMatrix[row] >> col) & 1) === 1;
  };

  // Format byte as hex
  const toHex = (byte: number): string => {
    return '0x' + byte.toString(16).toUpperCase().padStart(2, '0');
  };

  return (
    <Card variant="default" className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Affine Matrix (K)</CardTitle>
          <span
            className={cn(
              'px-2 py-1 text-sm font-bold border-2 border-[--color-ink]',
              isMatrixValid ? 'bg-[--color-green]' : 'bg-[--color-red] text-white'
            )}
          >
            {isMatrixValid ? 'VALID' : 'INVALID'}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {/* Matrix Grid */}
        <div className="flex gap-4">
          {/* Column headers */}
          <div className="flex flex-col">
            <div className="h-6 mb-1" /> {/* Spacer for row header */}
            {Array.from({ length: 8 }).map((_, row) => (
              <div
                key={row}
                className="h-10 w-8 flex items-center justify-center font-mono text-sm font-bold"
              >
                {row}
              </div>
            ))}
          </div>

          {/* Matrix cells */}
          <div>
            {/* Row headers */}
            <div className="flex mb-1">
              {Array.from({ length: 8 }).map((_, col) => (
                <div
                  key={col}
                  className="w-10 h-6 flex items-center justify-center font-mono text-sm font-bold"
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-8 gap-0.5">
              {Array.from({ length: 8 }).map((_, row) =>
                Array.from({ length: 8 }).map((_, col) => {
                  const isActive = getBit(row, col);
                  return (
                    <button
                      key={`${row}-${col}`}
                      onClick={() => toggleMatrixBit(row, col)}
                      className={cn(
                        'w-10 h-10 border-2 border-[--color-ink] font-mono font-bold text-lg',
                        'transition-all duration-100',
                        'hover:shadow-[2px_2px_0_var(--color-ink)] hover:-translate-x-0.5 hover:-translate-y-0.5',
                        isActive
                          ? 'bg-[--color-yellow] text-[--color-ink]'
                          : 'bg-[--color-cream] text-gray-400'
                      )}
                    >
                      {isActive ? '1' : '0'}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Hex values */}
          <div className="flex flex-col">
            <div className="h-6 mb-1 flex items-center font-mono text-sm font-bold">
              HEX
            </div>
            {affineMatrix.map((byte, row) => (
              <div
                key={row}
                className="h-10 px-2 flex items-center justify-center font-mono text-sm bg-[--color-cream-dark] border-2 border-[--color-ink]"
              >
                {toHex(byte)}
              </div>
            ))}
          </div>
        </div>

        {/* Constant input */}
        <div className="mt-4 flex items-center gap-4">
          <label className="font-bold uppercase text-sm">
            Constant (C):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={toHex(constant)}
              onChange={(e) => {
                const val = parseInt(e.target.value, 16);
                if (!isNaN(val) && val >= 0 && val <= 255) {
                  setConstant(val);
                }
              }}
              className="w-20 px-2 py-1 font-mono border-2 border-[--color-ink] bg-white"
            />
            <span className="font-mono text-sm text-gray-500">
              (binary: {constant.toString(2).padStart(8, '0')})
            </span>
          </div>
        </div>

        {/* Preset buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => loadPreset('K44' as MatrixPreset)}
          >
            K44 (Paper)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadPreset('KAES' as MatrixPreset)}
          >
            Standard AES
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={randomizeMatrix}
          >
            Random
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={clearMatrix}
          >
            Clear
          </Button>
        </div>

        {/* Info text */}
        <div className="mt-4 p-3 bg-[--color-cream-dark] border-2 border-[--color-ink] text-sm">
          <p className="font-bold mb-1">Equation (2) from paper:</p>
          <p className="font-mono">B(X) = (K &middot; X<sup>-1</sup> + C) mod 2</p>
          <p className="mt-2 text-gray-600">
            Click cells to toggle bits. Matrix must be invertible for valid S-box generation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
