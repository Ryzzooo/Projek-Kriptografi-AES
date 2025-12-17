/**
 * AES-128 Implementation with Custom S-box Support
 * 10-round encryption/decryption
 */

import { RCON, MIX_COLUMNS_MATRIX, INV_MIX_COLUMNS_MATRIX } from './consts';
import { gfMultiplyConstant } from './galois';
import { generateInverseSBox } from './sbox';

export type State = number[][];

/**
 * Convert 16-byte array to 4x4 state matrix (column-major order)
 */
export function bytesToState(bytes: Uint8Array | number[]): State {
  const state: State = Array.from({ length: 4 }, () => new Array(4).fill(0));
  for (let i = 0; i < 16; i++) {
    state[i % 4][Math.floor(i / 4)] = bytes[i];
  }
  return state;
}

/**
 * Convert 4x4 state matrix to 16-byte array
 */
export function stateToBytes(state: State): Uint8Array {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = state[i % 4][Math.floor(i / 4)];
  }
  return bytes;
}

/**
 * Clone a state matrix
 */
export function cloneState(state: State): State {
  return state.map(row => [...row]);
}

/**
 * SubBytes transformation - substitute each byte using S-box
 */
export function subBytes(state: State, sbox: number[] | readonly number[]): State {
  const result = cloneState(state);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i][j] = sbox[state[i][j]];
    }
  }
  return result;
}

/**
 * Inverse SubBytes transformation
 */
export function invSubBytes(state: State, invSbox: number[] | readonly number[]): State {
  return subBytes(state, invSbox);
}

/**
 * ShiftRows transformation - cyclically shift rows
 */
export function shiftRows(state: State): State {
  const result = cloneState(state);
  // Row 0: no shift
  // Row 1: shift left by 1
  // Row 2: shift left by 2
  // Row 3: shift left by 3
  for (let row = 1; row < 4; row++) {
    const temp = [...result[row]];
    for (let col = 0; col < 4; col++) {
      result[row][col] = temp[(col + row) % 4];
    }
  }
  return result;
}

/**
 * Inverse ShiftRows transformation
 */
export function invShiftRows(state: State): State {
  const result = cloneState(state);
  for (let row = 1; row < 4; row++) {
    const temp = [...result[row]];
    for (let col = 0; col < 4; col++) {
      result[row][col] = temp[(col - row + 4) % 4];
    }
  }
  return result;
}

/**
 * MixColumns transformation - multiply each column by fixed matrix
 */
export function mixColumns(state: State): State {
  const result: State = Array.from({ length: 4 }, () => new Array(4).fill(0));

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum ^= gfMultiplyConstant(state[k][col], MIX_COLUMNS_MATRIX[row][k]);
      }
      result[row][col] = sum;
    }
  }

  return result;
}

/**
 * Inverse MixColumns transformation
 */
export function invMixColumns(state: State): State {
  const result: State = Array.from({ length: 4 }, () => new Array(4).fill(0));

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum ^= gfMultiplyConstant(state[k][col], INV_MIX_COLUMNS_MATRIX[row][k]);
      }
      result[row][col] = sum;
    }
  }

  return result;
}

/**
 * AddRoundKey transformation - XOR state with round key
 */
export function addRoundKey(state: State, roundKey: State): State {
  const result = cloneState(state);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i][j] ^= roundKey[i][j];
    }
  }
  return result;
}

/**
 * Key expansion - generate 11 round keys from 128-bit key
 */
export function keyExpansion(
  key: Uint8Array | number[],
  sbox: number[] | readonly number[]
): State[] {
  const Nk = 4; // Key length in 32-bit words
  const Nr = 10; // Number of rounds
  const Nb = 4; // Block size in 32-bit words

  // Initialize W with the key
  const W: number[][] = [];

  // First Nk words are the key itself
  for (let i = 0; i < Nk; i++) {
    W.push([key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]]);
  }

  // Generate remaining words
  for (let i = Nk; i < Nb * (Nr + 1); i++) {
    let temp = [...W[i - 1]];

    if (i % Nk === 0) {
      // RotWord
      temp = [temp[1], temp[2], temp[3], temp[0]];
      // SubWord
      temp = temp.map(b => sbox[b]);
      // XOR with Rcon
      temp[0] ^= RCON[Math.floor(i / Nk) - 1];
    }

    W.push(W[i - Nk].map((b, j) => b ^ temp[j]));
  }

  // Convert to round keys (4x4 state matrices)
  const roundKeys: State[] = [];
  for (let round = 0; round <= Nr; round++) {
    const roundKey: State = Array.from({ length: 4 }, () => new Array(4).fill(0));
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        roundKey[row][col] = W[round * 4 + col][row];
      }
    }
    roundKeys.push(roundKey);
  }

  return roundKeys;
}

/**
 * Encrypt a single 16-byte block
 */
export function encryptBlock(
  block: Uint8Array | number[],
  key: Uint8Array | number[],
  sbox: number[] | readonly number[]
): Uint8Array {
  const roundKeys = keyExpansion(key, sbox);
  let state = bytesToState(block);

  // Round 0: AddRoundKey only
  state = addRoundKey(state, roundKeys[0]);

  // Rounds 1-9: SubBytes, ShiftRows, MixColumns, AddRoundKey
  for (let round = 1; round < 10; round++) {
    state = subBytes(state, sbox);
    state = shiftRows(state);
    state = mixColumns(state);
    state = addRoundKey(state, roundKeys[round]);
  }

  // Round 10: SubBytes, ShiftRows, AddRoundKey (no MixColumns)
  state = subBytes(state, sbox);
  state = shiftRows(state);
  state = addRoundKey(state, roundKeys[10]);

  return stateToBytes(state);
}

/**
 * Decrypt a single 16-byte block
 */
export function decryptBlock(
  block: Uint8Array | number[],
  key: Uint8Array | number[],
  sbox: number[] | readonly number[]
): Uint8Array {
  const invSbox = generateInverseSBox(sbox);
  const roundKeys = keyExpansion(key, sbox);
  let state = bytesToState(block);

  // Round 10: AddRoundKey, InvShiftRows, InvSubBytes
  state = addRoundKey(state, roundKeys[10]);
  state = invShiftRows(state);
  state = invSubBytes(state, invSbox);

  // Rounds 9-1: AddRoundKey, InvMixColumns, InvShiftRows, InvSubBytes
  for (let round = 9; round >= 1; round--) {
    state = addRoundKey(state, roundKeys[round]);
    state = invMixColumns(state);
    state = invShiftRows(state);
    state = invSubBytes(state, invSbox);
  }

  // Round 0: AddRoundKey
  state = addRoundKey(state, roundKeys[0]);

  return stateToBytes(state);
}

/**
 * Encrypt with step-by-step visualization data
 */
export interface EncryptionStep {
  round: number;
  operation: 'initial' | 'subBytes' | 'shiftRows' | 'mixColumns' | 'addRoundKey';
  state: State;
  roundKey?: State;
}

export function encryptBlockWithSteps(
  block: Uint8Array | number[],
  key: Uint8Array | number[],
  sbox: number[] | readonly number[]
): { ciphertext: Uint8Array; steps: EncryptionStep[]; roundKeys: State[] } {
  const roundKeys = keyExpansion(key, sbox);
  const steps: EncryptionStep[] = [];
  let state = bytesToState(block);

  steps.push({ round: 0, operation: 'initial', state: cloneState(state) });

  // Round 0
  state = addRoundKey(state, roundKeys[0]);
  steps.push({ round: 0, operation: 'addRoundKey', state: cloneState(state), roundKey: roundKeys[0] });

  // Rounds 1-9
  for (let round = 1; round < 10; round++) {
    state = subBytes(state, sbox);
    steps.push({ round, operation: 'subBytes', state: cloneState(state) });

    state = shiftRows(state);
    steps.push({ round, operation: 'shiftRows', state: cloneState(state) });

    state = mixColumns(state);
    steps.push({ round, operation: 'mixColumns', state: cloneState(state) });

    state = addRoundKey(state, roundKeys[round]);
    steps.push({ round, operation: 'addRoundKey', state: cloneState(state), roundKey: roundKeys[round] });
  }

  // Round 10
  state = subBytes(state, sbox);
  steps.push({ round: 10, operation: 'subBytes', state: cloneState(state) });

  state = shiftRows(state);
  steps.push({ round: 10, operation: 'shiftRows', state: cloneState(state) });

  state = addRoundKey(state, roundKeys[10]);
  steps.push({ round: 10, operation: 'addRoundKey', state: cloneState(state), roundKey: roundKeys[10] });

  return { ciphertext: stateToBytes(state), steps, roundKeys };
}

/**
 * PKCS7 padding
 */
export function pkcs7Pad(data: Uint8Array): Uint8Array {
  const blockSize = 16;
  const padLen = blockSize - (data.length % blockSize);
  const padded = new Uint8Array(data.length + padLen);
  padded.set(data);
  padded.fill(padLen, data.length);
  return padded;
}

/**
 * PKCS7 unpadding
 */
export function pkcs7Unpad(data: Uint8Array): Uint8Array {
  if (data.length === 0) {
    throw new Error('Invalid padding: empty data');
  }

  const padLen = data[data.length - 1];
  if (padLen > 16 || padLen === 0) {
    throw new Error(`Invalid padding length: ${padLen}`);
  }

  if (padLen > data.length) {
    throw new Error(`Padding length ${padLen} exceeds data length ${data.length}`);
  }

  // Verify all padding bytes are correct
  for (let i = data.length - padLen; i < data.length; i++) {
    if (data[i] !== padLen) {
      throw new Error(`Invalid padding byte at position ${i}: expected ${padLen}, got ${data[i]}`);
    }
  }

  return data.slice(0, data.length - padLen);
}

/**
 * Encrypt arbitrary-length plaintext (ECB mode)
 */
export function encrypt(
  plaintext: string,
  keyStr: string,
  sbox: number[] | readonly number[]
): Uint8Array {
  const encoder = new TextEncoder();
  const data = pkcs7Pad(encoder.encode(plaintext));
  const key = encoder.encode(keyStr.padEnd(16, '\0').slice(0, 16));

  const result = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i += 16) {
    const block = data.slice(i, i + 16);
    const encrypted = encryptBlock(block, key, sbox);
    result.set(encrypted, i);
  }

  return result;
}

/**
 * Decrypt arbitrary-length ciphertext (ECB mode)
 */
export function decrypt(
  ciphertext: Uint8Array,
  keyStr: string,
  sbox: number[] | readonly number[]
): string {
  const encoder = new TextEncoder();
  const key = encoder.encode(keyStr.padEnd(16, '\0').slice(0, 16));

  const result = new Uint8Array(ciphertext.length);

  for (let i = 0; i < ciphertext.length; i += 16) {
    const block = ciphertext.slice(i, i + 16);
    const decrypted = decryptBlock(block, key, sbox);
    result.set(decrypted, i);
  }

  const decoder = new TextDecoder();
  return decoder.decode(pkcs7Unpad(result));
}
