import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a byte to a 2-character hex string
 */
export function toHex(byte: number): string {
  return byte.toString(16).padStart(2, '0').toUpperCase();
}

/**
 * Convert a byte to an 8-character binary string
 */
export function toBinary(byte: number): string {
  return byte.toString(2).padStart(8, '0');
}

/**
 * Convert hex string to bytes array
 */
export function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];
  const cleanHex = hex.replace(/\s/g, '');
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(parseInt(cleanHex.substr(i, 2), 16));
  }
  return bytes;
}

/**
 * Convert bytes array to hex string
 */
export function bytesToHex(bytes: number[] | Uint8Array): string {
  return Array.from(bytes).map(b => toHex(b)).join(' ');
}

/**
 * Convert string to bytes (UTF-8)
 */
export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Convert bytes to string (UTF-8)
 */
export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Generate a random 8x8 binary matrix (as 8 bytes)
 */
export function randomMatrix(): number[] {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 256));
}

/**
 * Check if a matrix is invertible (has full rank in GF(2))
 * This is a simplified check - for cryptographic purposes
 */
export function isMatrixInvertible(matrix: number[]): boolean {
  // Convert to 8x8 bit matrix and check rank using Gaussian elimination in GF(2)
  const m: number[][] = matrix.map(row => {
    const bits: number[] = [];
    for (let i = 0; i < 8; i++) {
      bits.push((row >> i) & 1);
    }
    return bits;
  });

  // Gaussian elimination in GF(2)
  let rank = 0;
  for (let col = 0; col < 8; col++) {
    // Find pivot
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

    // Eliminate
    for (let row = 0; row < 8; row++) {
      if (row !== rank && m[row][col] === 1) {
        for (let c = 0; c < 8; c++) {
          m[row][c] ^= m[rank][c];
        }
      }
    }

    rank++;
  }

  return rank === 8;
}

/**
 * Get color based on value (0-255) for S-box visualization
 */
export function getValueColor(value: number): string {
  const hue = Math.floor((value / 255) * 360);
  return `hsl(${hue}, 70%, 85%)`;
}
