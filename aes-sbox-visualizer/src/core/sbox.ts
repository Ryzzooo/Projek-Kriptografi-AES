/**
 * S-box Generation
 * Generates AES-style S-boxes using customizable affine matrices
 */

import { AES_CONSTANT, INVERSE_TABLE } from './consts';
import { applyAffine } from './affine';

/**
 * Generate a 256-byte S-box using the given affine matrix and constant
 *
 * The S-box is constructed as:
 * S-box[x] = AffineTransform(MultiplicativeInverse(x))
 *
 * For x = 0, the inverse is defined as 0 (special case)
 *
 * @param matrix - 8-byte array representing the 8x8 affine matrix
 * @param constant - 8-bit constant for affine transformation (default: 0x63)
 * @returns 256-byte S-box array
 */
export function generateSBox(
  matrix: number[] | readonly number[],
  constant: number = AES_CONSTANT
): number[] {
  const sbox: number[] = new Array(256);

  for (let x = 0; x < 256; x++) {
    // Get multiplicative inverse (0 maps to 0)
    const inverse = INVERSE_TABLE[x];

    // Apply affine transformation
    sbox[x] = applyAffine(inverse, matrix, constant);
  }

  return sbox;
}

/**
 * Generate the inverse S-box from a forward S-box
 *
 * The inverse S-box satisfies: InvSBox[SBox[x]] = x for all x
 *
 * @param sbox - 256-byte forward S-box
 * @returns 256-byte inverse S-box
 */
export function generateInverseSBox(sbox: number[] | readonly number[]): number[] {
  const invSbox: number[] = new Array(256);

  for (let i = 0; i < 256; i++) {
    invSbox[sbox[i]] = i;
  }

  return invSbox;
}

/**
 * Verify that an S-box is bijective (one-to-one mapping)
 *
 * A valid S-box must map each input to a unique output
 *
 * @param sbox - 256-byte S-box to verify
 * @returns true if bijective, false otherwise
 */
export function isSBoxBijective(sbox: number[] | readonly number[]): boolean {
  if (sbox.length !== 256) return false;

  const seen = new Set<number>();

  for (let i = 0; i < 256; i++) {
    const value = sbox[i];

    // Check value is in valid range
    if (value < 0 || value > 255) return false;

    // Check for duplicates
    if (seen.has(value)) return false;

    seen.add(value);
  }

  return seen.size === 256;
}

/**
 * Verify that an S-box is balanced
 *
 * An S-box is balanced if for each output bit position,
 * exactly 128 inputs produce 0 and 128 produce 1
 *
 * @param sbox - 256-byte S-box to verify
 * @returns true if balanced, false otherwise
 */
export function isSBoxBalanced(sbox: number[] | readonly number[]): boolean {
  // Check each bit position
  for (let bit = 0; bit < 8; bit++) {
    let ones = 0;

    for (let i = 0; i < 256; i++) {
      if ((sbox[i] >> bit) & 1) {
        ones++;
      }
    }

    // Must have exactly 128 ones and 128 zeros
    if (ones !== 128) return false;
  }

  return true;
}

/**
 * Check if S-box has any fixed points (S-box[x] = x)
 *
 * @param sbox - 256-byte S-box
 * @returns Array of fixed point values, empty if none
 */
export function findFixedPoints(sbox: number[] | readonly number[]): number[] {
  const fixedPoints: number[] = [];

  for (let i = 0; i < 256; i++) {
    if (sbox[i] === i) {
      fixedPoints.push(i);
    }
  }

  return fixedPoints;
}

/**
 * Check if S-box has any opposite fixed points (S-box[x] = ~x & 0xFF)
 *
 * @param sbox - 256-byte S-box
 * @returns Array of opposite fixed point values, empty if none
 */
export function findOppositeFixedPoints(sbox: number[] | readonly number[]): number[] {
  const oppositeFixed: number[] = [];

  for (let i = 0; i < 256; i++) {
    if (sbox[i] === (~i & 0xFF)) {
      oppositeFixed.push(i);
    }
  }

  return oppositeFixed;
}

/**
 * Compare two S-boxes and return the number of different entries
 *
 * @param sbox1 - First S-box
 * @param sbox2 - Second S-box
 * @returns Number of positions where the S-boxes differ
 */
export function compareSBoxes(
  sbox1: number[] | readonly number[],
  sbox2: number[] | readonly number[]
): number {
  let differences = 0;

  for (let i = 0; i < 256; i++) {
    if (sbox1[i] !== sbox2[i]) {
      differences++;
    }
  }

  return differences;
}

/**
 * Get S-box entry with row and column indexing (like in paper tables)
 * Row is high nibble, column is low nibble
 *
 * @param sbox - 256-byte S-box
 * @param row - Row index (0-15)
 * @param col - Column index (0-15)
 * @returns S-box value at position row*16 + col
 */
export function getSBoxEntry(
  sbox: number[] | readonly number[],
  row: number,
  col: number
): number {
  return sbox[(row << 4) | col];
}

/**
 * Format S-box as a 16x16 hex grid string (like paper tables)
 *
 * @param sbox - 256-byte S-box
 * @returns Formatted string representation
 */
export function formatSBoxAsTable(sbox: number[] | readonly number[]): string {
  let result = '     ';

  // Header row
  for (let col = 0; col < 16; col++) {
    result += col.toString(16).toUpperCase().padStart(3, ' ');
  }
  result += '\n';

  // Data rows
  for (let row = 0; row < 16; row++) {
    result += row.toString(16).toUpperCase().padStart(2, ' ') + '  ';

    for (let col = 0; col < 16; col++) {
      const value = sbox[(row << 4) | col];
      result += value.toString().padStart(3, ' ');
    }
    result += '\n';
  }

  return result;
}

/**
 * Apply S-box substitution to a single byte
 *
 * @param sbox - 256-byte S-box
 * @param byte - Input byte
 * @returns Substituted byte
 */
export function substitute(sbox: number[] | readonly number[], byte: number): number {
  return sbox[byte & 0xFF];
}

/**
 * Apply S-box substitution to an array of bytes
 *
 * @param sbox - 256-byte S-box
 * @param bytes - Input byte array
 * @returns New array with substituted bytes
 */
export function substituteBytes(
  sbox: number[] | readonly number[],
  bytes: number[] | Uint8Array
): number[] {
  return Array.from(bytes).map(b => sbox[b & 0xFF]);
}
