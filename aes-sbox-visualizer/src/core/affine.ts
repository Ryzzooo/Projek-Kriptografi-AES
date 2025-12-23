/**
 * Affine Transformation for S-box Generation
 * Implements Equation (2) from paper: B(X) = (K · X^-1 + C) mod 2
 */

import { AES_CONSTANT } from './consts';

/**
 * Apply affine transformation to a byte
 *
 * The transformation follows Equation (2) from the paper:
 * B(X) = (K · X^-1 + C) mod 2
 *
 * Where:
 * - K is an 8x8 affine matrix (represented as 8 bytes, each row is a byte)
 * - X^-1 is the multiplicative inverse input (already computed)
 * - C is the 8-bit constant (typically 0x63)
 *
 * Matrix multiplication in GF(2):
 * - Each output bit i is: XOR of (matrix[i][j] AND input[j]) for all j, then XOR with constant[i]
 *
 * @param byteVal - The multiplicative inverse value to transform
 * @param matrix - 8-byte array representing the 8x8 affine matrix (row-major)
 * @param constant - 8-bit constant for the affine transformation (default: 0x63)
 * @returns Transformed byte value
 */
export function applyAffine(
  byteVal: number,
  matrix: number[] | readonly number[],
  constant: number = AES_CONSTANT
): number {
  let result = 0;

  // For each output bit (row of the matrix)
  for (let i = 0; i < 8; i++) {
    let bit = 0;

    // For each input bit (column of the matrix)
    for (let j = 0; j < 8; j++) {
      // Check if matrix[i][j] is 1 (bit j of row i)
      const matrixBit = (matrix[i] >> j) & 1;

      // Check if input bit j is 1
      const inputBit = (byteVal >> j) & 1;

      // XOR if both are 1
      if (matrixBit && inputBit) {
        bit ^= 1;
      }
    }

    // Set output bit i if the XOR result is 1
    if (bit) {
      result |= (1 << i);
    }
  }

  // XOR with constant
  return result ^ constant;
}

/**
 * Apply inverse affine transformation
 * Used for decryption (inverse S-box generation)
 *
 * The inverse is: X^-1 = K^-1 · (B(X) + C) mod 2
 *
 * For the standard AES inverse affine matrix
 *
 * @param byteVal - The S-box output value to inverse transform
 * @param invMatrix - 8-byte array representing the inverse affine matrix
 * @param constant - 8-bit constant (same as forward transformation)
 * @returns Inverse transformed byte (multiplicative inverse)
 */
export function applyInverseAffine(
  byteVal: number,
  invMatrix: number[] | readonly number[],
  constant: number = AES_CONSTANT
): number {
  // First XOR with constant
  const xored = byteVal ^ constant;

  let result = 0;

  // Apply inverse matrix multiplication
  for (let i = 0; i < 8; i++) {
    let bit = 0;

    for (let j = 0; j < 8; j++) {
      const matrixBit = (invMatrix[i] >> j) & 1;
      const inputBit = (xored >> j) & 1;

      if (matrixBit && inputBit) {
        bit ^= 1;
      }
    }

    if (bit) {
      result |= (1 << i);
    }
  }

  return result;
}

/**
 * Convert an 8x8 binary matrix (2D array) to row byte array
 *
 * @param matrix - 8x8 array of 0s and 1s
 * @returns 8-byte array where each byte represents a row
 */
export function matrixToBytes(matrix: number[][]): number[] {
  const bytes: number[] = [];

  for (let i = 0; i < 8; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      if (matrix[i][j]) {
        byte |= (1 << j);
      }
    }
    bytes.push(byte);
  }

  return bytes;
}

/**
 * Convert row byte array to 8x8 binary matrix
 *
 * @param bytes - 8-byte array where each byte represents a row
 * @returns 8x8 array of 0s and 1s
 */
export function bytesToMatrix(bytes: number[] | readonly number[]): number[][] {
  const matrix: number[][] = [];

  for (let i = 0; i < 8; i++) {
    const row: number[] = [];
    for (let j = 0; j < 8; j++) {
      row.push((bytes[i] >> j) & 1);
    }
    matrix.push(row);
  }

  return matrix;
}

/**
 * Get a specific bit from a matrix
 *
 * @param matrix - Row byte array
 * @param row - Row index (0-7)
 * @param col - Column index (0-7)
 * @returns 0 or 1
 */
export function getMatrixBit(
  matrix: number[] | readonly number[],
  row: number,
  col: number
): number {
  return (matrix[row] >> col) & 1;
}

/**
 * Set a specific bit in a matrix
 *
 * @param matrix - Row byte array (will be modified)
 * @param row - Row index (0-7)
 * @param col - Column index (0-7)
 * @param value - 0 or 1
 */
export function setMatrixBit(
  matrix: number[],
  row: number,
  col: number,
  value: boolean | number
): void {
  if (value) {
    matrix[row] |= (1 << col);
  } else {
    matrix[row] &= ~(1 << col);
  }
}

/**
 * Toggle a specific bit in a matrix
 *
 * @param matrix - Row byte array (will be modified)
 * @param row - Row index (0-7)
 * @param col - Column index (0-7)
 */
export function toggleMatrixBit(matrix: number[], row: number, col: number): void {
  matrix[row] ^= (1 << col);
}

/**
 * Check if a matrix is valid for S-box generation
 * A valid matrix must be invertible (full rank) in GF(2)
 *
 * @param matrix - Row byte array
 * @returns true if matrix is invertible
 */
export function isMatrixValid(matrix: number[] | readonly number[]): boolean {
  // Convert to 2D array for Gaussian elimination
  const m: number[][] = [];
  for (let i = 0; i < 8; i++) {
    const row: number[] = [];
    for (let j = 0; j < 8; j++) {
      row.push((matrix[i] >> j) & 1);
    }
    m.push(row);
  }

  // Gaussian elimination to find rank
  let rank = 0;

  for (let col = 0; col < 8; col++) {
    // Find pivot row
    let pivotRow = -1;
    for (let row = rank; row < 8; row++) {
      if (m[row][col] === 1) {
        pivotRow = row;
        break;
      }
    }

    if (pivotRow === -1) continue;

    // Swap rows
    [m[rank], m[pivotRow]] = [m[pivotRow], m[rank]];

    // Eliminate other rows
    for (let row = 0; row < 8; row++) {
      if (row !== rank && m[row][col] === 1) {
        for (let c = 0; c < 8; c++) {
          m[row][c] ^= m[rank][c];
        }
      }
    }

    rank++;
  }

  // Matrix is invertible if rank is 8
  return rank === 8;
}

/**
 * Compute the inverse of an affine matrix in GF(2)
 *
 * @param matrix - Row byte array of the matrix to invert
 * @returns Row byte array of the inverse matrix, or null if not invertible
 */
export function invertMatrix(matrix: number[] | readonly number[]): number[] | null {
  // Create augmented matrix [A | I]
  const aug: number[][] = [];
  for (let i = 0; i < 8; i++) {
    const row: number[] = [];
    // Original matrix
    for (let j = 0; j < 8; j++) {
      row.push((matrix[i] >> j) & 1);
    }
    // Identity matrix
    for (let j = 0; j < 8; j++) {
      row.push(i === j ? 1 : 0);
    }
    aug.push(row);
  }

  // Gaussian elimination with pivoting
  for (let col = 0; col < 8; col++) {
    // Find pivot
    let pivotRow = -1;
    for (let row = col; row < 8; row++) {
      if (aug[row][col] === 1) {
        pivotRow = row;
        break;
      }
    }

    if (pivotRow === -1) {
      // Matrix is singular
      return null;
    }

    // Swap rows
    [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];

    // Eliminate
    for (let row = 0; row < 8; row++) {
      if (row !== col && aug[row][col] === 1) {
        for (let c = 0; c < 16; c++) {
          aug[row][c] ^= aug[col][c];
        }
      }
    }
  }

  // Extract inverse from right half
  const inv: number[] = [];
  for (let i = 0; i < 8; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      if (aug[i][8 + j]) {
        byte |= (1 << j);
      }
    }
    inv.push(byte);
  }

  return inv;
}
