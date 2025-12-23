/**
 * AES S-box Modification Constants
 * Based on: "AES S-box modification uses affine matrices exploration"
 * by Alamsyah et al. (Nonlinear Dynamics, 2025)
 */

/**
 * AES Irreducible Polynomial: x^8 + x^4 + x^3 + x + 1
 * Used for GF(2^8) field operations
 */
export const IRREDUCIBLE_POLY = 0x11B;

/**
 * AES Constant (C_AES): 0x63 = 01100011 in binary
 * Used in the affine transformation
 */
export const AES_CONSTANT = 0x63;

/**
 * Standard Multiplicative Inverse Table (Table 1 from paper)
 * 256 values representing the multiplicative inverse of each byte in GF(2^8)
 * Using irreducible polynomial x^8 + x^4 + x^3 + x + 1
 *
 * For any byte x: INVERSE_TABLE[x] * x ≡ 1 (mod IRREDUCIBLE_POLY)
 * Special case: INVERSE_TABLE[0] = 0 (0 has no inverse)
 */
export const INVERSE_TABLE: readonly number[] = [
  0,   1,   141, 246, 203, 82,  123, 209, 232, 79,  41,  192, 176, 225, 229, 199,
  116, 180, 170, 75,  153, 43,  96,  95,  88,  63,  253, 204, 255, 64,  238, 178,
  58,  110, 90,  241, 85,  77,  168, 201, 193, 10,  152, 21,  48,  68,  162, 194,
  44,  69,  146, 108, 243, 57,  102, 66,  242, 53,  32,  111, 119, 187, 89,  25,
  29,  254, 55,  103, 45,  49,  245, 105, 167, 100, 171, 19,  84,  37,  233, 9,
  237, 92,  5,   202, 76,  36,  135, 191, 24,  62,  34,  240, 81,  236, 97,  23,
  22,  94,  175, 211, 73,  166, 54,  67,  244, 71,  145, 223, 51,  147, 33,  59,
  121, 183, 151, 133, 16,  181, 186, 60,  182, 112, 208, 6,   161, 250, 129, 130,
  131, 126, 127, 128, 150, 115, 190, 86,  155, 158, 149, 217, 247, 2,   185, 164,
  222, 106, 50,  109, 216, 138, 132, 114, 42,  20,  159, 136, 249, 220, 137, 154,
  251, 124, 46,  195, 143, 184, 101, 72,  38,  200, 18,  74,  206, 231, 210, 98,
  12,  224, 31,  239, 17,  117, 120, 113, 165, 142, 118, 61,  189, 188, 134, 87,
  11,  40,  47,  163, 218, 212, 228, 15,  169, 39,  83,  4,   27,  252, 172, 230,
  122, 7,   174, 99,  197, 219, 226, 234, 148, 139, 196, 213, 157, 248, 144, 107,
  177, 13,  214, 235, 198, 14,  207, 173, 8,   78,  215, 227, 93,  80,  30,  179,
  91,  35,  56,  52,  104, 70,  3,   140, 221, 156, 125, 160, 205, 26,  65,  28
] as const;

/**
 * K44 Affine Matrix (optimal matrix from paper)
 * This matrix produces S-box44 with superior cryptographic properties:
 * - NL (Nonlinearity): 112
 * - SAC (Strict Avalanche Criterion): 0.50073
 * - BIC-NL: 112
 * - BIC-SAC: 0.50237
 * - LAP: 0.0625
 * - DAP: 0.015625
 *
 * Matrix representation (each row as a byte, bits read LSB to MSB):
 * Row 0: 01010111 = 0x57
 * Row 1: 10101011 = 0xAB
 * Row 2: 11010101 = 0xD5
 * Row 3: 11101010 = 0xEA
 * Row 4: 01110101 = 0x75
 * Row 5: 10111010 = 0xBA
 * Row 6: 01011101 = 0x5D
 * Row 7: 10101110 = 0xAE
 */
export const K44_MATRIX: readonly number[] = [
  0x57, // 01010111
  0xAB, // 10101011
  0xD5, // 11010101
  0xEA, // 11101010
  0x75, // 01110101
  0xBA, // 10111010
  0x5D, // 01011101
  0xAE  // 10101110
] as const;

/**
 * Standard AES Affine Matrix (K_AES)
 * The original matrix used in the AES S-box construction
 *
 * Matrix representation:
 * [1 0 0 0 1 1 1 1]   = 0x8F (reading bits 0-7)
 * [1 1 0 0 0 1 1 1]   = 0xC7
 * [1 1 1 0 0 0 1 1]   = 0xE3
 * [1 1 1 1 0 0 0 1]   = 0xF1
 * [1 1 1 1 1 0 0 0]   = 0xF8
 * [0 1 1 1 1 1 0 0]   = 0x7C
 * [0 0 1 1 1 1 1 0]   = 0x3E
 * [0 0 0 1 1 1 1 1]   = 0x1F
 */
export const KAES_MATRIX: readonly number[] = [
  0x8F, // 10001111
  0xC7, // 11000111
  0xE3, // 11100011
  0xF1, // 11110001
  0xF8, // 11111000
  0x7C, // 01111100
  0x3E, // 00111110
  0x1F  // 00011111
] as const;

/**
 * Expected S-box44 (generated using K44 matrix and AES constant 0x63)
 * Used for verification that the implementation matches the reference
 */
export const EXPECTED_SBOX44: readonly number[] = [
  0x63, 0x34, 0xA5, 0x21, 0x86, 0xE0, 0xE7, 0xB2, 0xC0, 0xFD, 0x64, 0x90, 0x02, 0x7D, 0xA8, 0xB9,
  0x24, 0xD7, 0x36, 0x28, 0x05, 0xCF, 0x84, 0x88, 0xA1, 0x6F, 0x37, 0xAF, 0x9C, 0x3E, 0xBE, 0xA9,
  0xED, 0x10, 0x0A, 0x08, 0xC9, 0x56, 0x9D, 0x2D, 0xC7, 0x22, 0x52, 0x94, 0xAC, 0xEB, 0xDC, 0x3B,
  0xE6, 0xBC, 0x13, 0xBB, 0xA3, 0x11, 0xFA, 0x95, 0xF4, 0x2E, 0xD9, 0x47, 0xD8, 0x14, 0xF6, 0xAB,
  0x7E, 0xCB, 0x85, 0xAD, 0xB1, 0xFB, 0xDD, 0x39, 0x5E, 0x51, 0x61, 0xEA, 0x9E, 0x5B, 0x97, 0xDE,
  0x42, 0x74, 0xE1, 0xD1, 0x01, 0x0C, 0xE4, 0xC1, 0xFC, 0x38, 0x72, 0x5F, 0x1C, 0x15, 0xD3, 0x3F,
  0x68, 0xDF, 0xB4, 0x19, 0x83, 0x09, 0xD2, 0xC2, 0x8A, 0x17, 0xEF, 0x26, 0x50, 0x44, 0x8E, 0xBA,
  0x4C, 0x2B, 0x91, 0x4F, 0x16, 0x80, 0x43, 0x93, 0x7C, 0xF1, 0xE5, 0x1D, 0x20, 0x1E, 0x9A, 0x66,
  0x31, 0x65, 0x32, 0xCD, 0xC6, 0x0D, 0x96, 0x35, 0xAE, 0x2C, 0x3A, 0x58, 0x76, 0xC8, 0xBF, 0xA2,
  0x71, 0xC5, 0x07, 0xEC, 0x0F, 0x8C, 0x18, 0x5A, 0x98, 0xC3, 0x7B, 0x27, 0xE2, 0xDA, 0x70, 0xF9,
  0x49, 0xCE, 0x4D, 0x6C, 0x0E, 0xE8, 0x06, 0xD4, 0xA7, 0x7A, 0xBD, 0x7F, 0x04, 0x03, 0x4E, 0x2F,
  0x5C, 0x2A, 0xD5, 0xE9, 0x41, 0x73, 0x1B, 0xA6, 0xF5, 0x59, 0x8F, 0xC4, 0x6A, 0x3D, 0xB3, 0x62,
  0x75, 0x33, 0x1A, 0x8B, 0xA4, 0x30, 0xFF, 0xA0, 0xCA, 0xF0, 0xB7, 0xB6, 0x00, 0x60, 0x48, 0x54,
  0xB0, 0x4A, 0xE3, 0x78, 0x12, 0xF3, 0x81, 0x6B, 0x6D, 0xDB, 0x45, 0x67, 0xD0, 0xB5, 0xB8, 0x92,
  0x55, 0x0B, 0x9B, 0x3C, 0xEE, 0xF7, 0x53, 0x1F, 0x89, 0xAA, 0xCC, 0xD6, 0x23, 0x4B, 0x82, 0xFE,
  0x5D, 0x25, 0x46, 0x79, 0x6E, 0x40, 0x9F, 0xF2, 0x8D, 0x87, 0x99, 0x77, 0xF8, 0x57, 0x69, 0x29
] as const;

/**
 * Standard AES S-box (Table 2 from paper)
 * For comparison with modified S-boxes
 */
export const AES_SBOX: readonly number[] = [
  99,  124, 119, 123, 242, 107, 111, 197, 48,  1,   103, 43,  254, 215, 171, 118,
  202, 130, 201, 125, 250, 89,  71,  240, 173, 212, 162, 175, 156, 164, 114, 192,
  183, 253, 147, 38,  54,  63,  247, 204, 52,  165, 229, 241, 113, 216, 49,  21,
  4,   199, 35,  195, 24,  150, 5,   154, 7,   18,  128, 226, 235, 39,  178, 117,
  9,   131, 44,  26,  27,  110, 90,  160, 82,  59,  214, 179, 41,  227, 47,  132,
  83,  209, 0,   237, 32,  252, 177, 91,  106, 203, 190, 57,  74,  76,  88,  207,
  208, 239, 170, 251, 67,  77,  51,  133, 69,  249, 2,   127, 80,  60,  159, 168,
  81,  163, 64,  143, 146, 157, 56,  245, 188, 182, 218, 33,  16,  255, 243, 210,
  205, 12,  19,  236, 95,  151, 68,  23,  196, 167, 126, 61,  100, 93,  25,  115,
  96,  129, 79,  220, 34,  42,  144, 136, 70,  238, 184, 20,  222, 94,  11,  219,
  224, 50,  58,  10,  73,  6,   36,  92,  194, 211, 172, 98,  145, 149, 228, 121,
  231, 200, 55,  109, 141, 213, 78,  169, 108, 86,  244, 234, 101, 122, 174, 8,
  186, 120, 37,  46,  28,  166, 180, 198, 232, 221, 116, 31,  75,  189, 139, 138,
  112, 62,  181, 102, 72,  3,   246, 14,  97,  53,  87,  185, 134, 193, 29,  158,
  225, 248, 152, 17,  105, 217, 142, 148, 155, 30,  135, 233, 206, 85,  40,  223,
  140, 161, 137, 13,  191, 230, 66,  104, 65,  153, 45,  15,  176, 84,  187, 22
] as const;

/**
 * AES Round Constants (Rcon) for Key Expansion
 * Used in the key schedule algorithm
 */
export const RCON: readonly number[] = [
  0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1B, 0x36
] as const;

/**
 * MixColumns matrix for AES encryption
 * Each column of the state is multiplied by this matrix in GF(2^8)
 */
export const MIX_COLUMNS_MATRIX: readonly number[][] = [
  [0x02, 0x03, 0x01, 0x01],
  [0x01, 0x02, 0x03, 0x01],
  [0x01, 0x01, 0x02, 0x03],
  [0x03, 0x01, 0x01, 0x02]
] as const;

/**
 * Inverse MixColumns matrix for AES decryption
 */
export const INV_MIX_COLUMNS_MATRIX: readonly number[][] = [
  [0x0E, 0x0B, 0x0D, 0x09],
  [0x09, 0x0E, 0x0B, 0x0D],
  [0x0D, 0x09, 0x0E, 0x0B],
  [0x0B, 0x0D, 0x09, 0x0E]
] as const;

/**
 * Type for preset matrix names
 */
export type MatrixPreset = 'K44' | 'KAES';

/**
 * Get a preset matrix by name
 */
export function getPresetMatrix(preset: MatrixPreset): number[] {
  switch (preset) {
    case 'K44':
      return [...K44_MATRIX];
    case 'KAES':
      return [...KAES_MATRIX];
    default:
      return [...K44_MATRIX];
  }
}
