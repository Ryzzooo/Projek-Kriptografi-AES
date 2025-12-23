/**
 * Galois Field GF(2^8) Operations
 * Using irreducible polynomial: x^8 + x^4 + x^3 + x + 1 = 0x11B
 */

import { IRREDUCIBLE_POLY, INVERSE_TABLE } from './consts';

/**
 * Multiply two bytes in GF(2^8)
 * Uses the Russian peasant multiplication algorithm with reduction
 *
 * @param a - First operand (0-255)
 * @param b - Second operand (0-255)
 * @returns Product in GF(2^8)
 */
export function gfMultiply(a: number, b: number): number {
  let p = 0;
  let tempA = a;
  let tempB = b;

  for (let i = 0; i < 8; i++) {
    // If low bit of b is set, XOR p with a
    if (tempB & 1) {
      p ^= tempA;
    }

    // Check if high bit of a is set (will overflow)
    const hiBit = tempA & 0x80;

    // Shift a left by 1
    tempA = (tempA << 1) & 0xFF;

    // If high bit was set, reduce by XORing with irreducible polynomial
    if (hiBit) {
      tempA ^= IRREDUCIBLE_POLY & 0xFF; // XOR with lower 8 bits of 0x11B = 0x1B
    }

    // Shift b right by 1
    tempB >>= 1;
  }

  return p;
}

/**
 * Get the multiplicative inverse of a byte in GF(2^8)
 * Uses precomputed inverse table for O(1) lookup
 *
 * @param byte - Input byte (0-255)
 * @returns Multiplicative inverse (0 for input 0)
 */
export function gfInverse(byte: number): number {
  return INVERSE_TABLE[byte & 0xFF];
}

/**
 * Compute multiplicative inverse using extended Euclidean algorithm
 * This is slower than table lookup but useful for verification
 *
 * @param byte - Input byte (0-255)
 * @returns Multiplicative inverse (0 for input 0)
 */
export function gfInverseComputed(byte: number): number {
  if (byte === 0) return 0;

  // Extended Euclidean algorithm for GF(2^8)
  // Find x such that byte * x ≡ 1 (mod irreducible polynomial)

  // Using Fermat's little theorem: a^(2^8 - 1) = 1 in GF(2^8)
  // So a^(-1) = a^(2^8 - 2) = a^254

  let result = byte;
  for (let i = 0; i < 6; i++) {
    // Square 6 times and multiply
    result = gfMultiply(result, result);
    result = gfMultiply(result, byte);
  }
  // Square one more time to get a^254
  result = gfMultiply(result, result);

  return result;
}

/**
 * Add two bytes in GF(2^8)
 * Addition in GF(2) is XOR
 *
 * @param a - First operand
 * @param b - Second operand
 * @returns Sum (XOR) of a and b
 */
export function gfAdd(a: number, b: number): number {
  return a ^ b;
}

/**
 * Multiply a byte by x (0x02) in GF(2^8)
 * This is the xtime operation used in AES
 *
 * @param byte - Input byte
 * @returns byte * 0x02 in GF(2^8)
 */
export function xtime(byte: number): number {
  const result = (byte << 1) & 0xFF;
  return (byte & 0x80) ? result ^ 0x1B : result;
}

/**
 * Multiply byte by a specific constant used in MixColumns
 * Supports multiplication by 0x02, 0x03, 0x09, 0x0B, 0x0D, 0x0E
 *
 * @param byte - Input byte
 * @param multiplier - Constant multiplier
 * @returns Product in GF(2^8)
 */
export function gfMultiplyConstant(byte: number, multiplier: number): number {
  switch (multiplier) {
    case 0x01:
      return byte;
    case 0x02:
      return xtime(byte);
    case 0x03:
      return xtime(byte) ^ byte;
    case 0x09:
      return xtime(xtime(xtime(byte))) ^ byte;
    case 0x0B:
      return xtime(xtime(xtime(byte))) ^ xtime(byte) ^ byte;
    case 0x0D:
      return xtime(xtime(xtime(byte))) ^ xtime(xtime(byte)) ^ byte;
    case 0x0E:
      return xtime(xtime(xtime(byte))) ^ xtime(xtime(byte)) ^ xtime(byte);
    default:
      return gfMultiply(byte, multiplier);
  }
}

/**
 * Compute the power of a byte in GF(2^8)
 *
 * @param base - Base byte
 * @param exp - Exponent
 * @returns base^exp in GF(2^8)
 */
export function gfPow(base: number, exp: number): number {
  if (exp === 0) return 1;
  if (base === 0) return 0;

  let result = 1;
  let b = base;
  let e = exp;

  while (e > 0) {
    if (e & 1) {
      result = gfMultiply(result, b);
    }
    b = gfMultiply(b, b);
    e >>= 1;
  }

  return result;
}

/**
 * Verify the inverse table is correct
 * Returns true if all inverses are valid
 */
export function verifyInverseTable(): boolean {
  for (let i = 1; i < 256; i++) {
    const inv = INVERSE_TABLE[i];
    const product = gfMultiply(i, inv);
    if (product !== 1) {
      console.error(`Invalid inverse: ${i} * ${inv} = ${product}, expected 1`);
      return false;
    }
  }
  return true;
}
