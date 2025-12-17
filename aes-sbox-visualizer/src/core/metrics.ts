/**
 * Cryptographic Strength Metrics for S-box Analysis
 * Implements NL, SAC, BIC-NL, BIC-SAC, LAP, DAP from the paper
 */

/**
 * Count the number of 1 bits in a number (Hamming weight)
 */
function hammingWeight(n: number): number {
  let count = 0;
  let num = n;
  while (num) {
    count += num & 1;
    num >>>= 1;
  }
  return count;
}

/**
 * Compute Walsh-Hadamard Transform coefficient
 * Used for calculating nonlinearity
 */
function walshTransform(truthTable: number[], mask: number): number {
  let sum = 0;
  for (let x = 0; x < 256; x++) {
    const input = hammingWeight(x & mask) & 1;
    const output = truthTable[x];
    sum += input === output ? 1 : -1;
  }
  return sum;
}

/**
 * Calculate Nonlinearity (NL) of an S-box
 *
 * NL measures the minimum Hamming distance between the Boolean functions
 * of the S-box and all affine functions.
 *
 * Formula: NL(f) = min d(f, g) where g is any affine function
 *
 * Ideal value: 120
 * K44 achieves: 112
 *
 * @param sbox - 256-byte S-box
 * @returns Nonlinearity value (0-120)
 */
export function calculateNL(sbox: number[] | readonly number[]): number {
  let minNL = 120;

  // Check each output bit (component function)
  for (let bit = 0; bit < 8; bit++) {
    // Extract truth table for this bit
    const truthTable: number[] = [];
    for (let x = 0; x < 256; x++) {
      truthTable.push((sbox[x] >> bit) & 1);
    }

    // Find maximum Walsh coefficient
    let maxWalsh = 0;
    for (let mask = 0; mask < 256; mask++) {
      const coef = Math.abs(walshTransform(truthTable, mask));
      if (coef > maxWalsh) {
        maxWalsh = coef;
      }
    }

    // NL for this bit = 128 - maxWalsh/2
    const nl = 128 - maxWalsh / 2;
    if (nl < minNL) {
      minNL = nl;
    }
  }

  return minNL;
}

/**
 * Calculate Strict Avalanche Criterion (SAC)
 *
 * SAC measures how much output bits change when a single input bit is flipped.
 * For each input bit position, flipping it should change each output bit
 * with probability 0.5.
 *
 * Formula: SAC = (1/2^n) * Σ f(x) ⊕ f(x ⊕ c_i)
 *
 * Ideal value: 0.5
 * K44 achieves: 0.50073
 *
 * @param sbox - 256-byte S-box
 * @returns SAC value (0-1, closer to 0.5 is better)
 */
export function calculateSAC(sbox: number[] | readonly number[]): number {
  let totalFlips = 0;
  let totalTests = 0;

  // For each input bit position
  for (let inputBit = 0; inputBit < 8; inputBit++) {
    // For each output bit position
    for (let outputBit = 0; outputBit < 8; outputBit++) {
      let flips = 0;

      // Test all input values
      for (let x = 0; x < 256; x++) {
        // Flip input bit
        const xFlipped = x ^ (1 << inputBit);

        // Check if output bit changed
        const outOriginal = (sbox[x] >> outputBit) & 1;
        const outFlipped = (sbox[xFlipped] >> outputBit) & 1;

        if (outOriginal !== outFlipped) {
          flips++;
        }
      }

      totalFlips += flips;
      totalTests += 256;
    }
  }

  return totalFlips / totalTests;
}

/**
 * Calculate the SAC dependency matrix (8x8)
 * Shows probability of output bit i changing when input bit j is flipped
 *
 * @param sbox - 256-byte S-box
 * @returns 8x8 matrix of SAC values
 */
export function calculateSACMatrix(sbox: number[] | readonly number[]): number[][] {
  const matrix: number[][] = [];

  for (let outputBit = 0; outputBit < 8; outputBit++) {
    const row: number[] = [];
    for (let inputBit = 0; inputBit < 8; inputBit++) {
      let flips = 0;

      for (let x = 0; x < 256; x++) {
        const xFlipped = x ^ (1 << inputBit);
        const outOriginal = (sbox[x] >> outputBit) & 1;
        const outFlipped = (sbox[xFlipped] >> outputBit) & 1;

        if (outOriginal !== outFlipped) {
          flips++;
        }
      }

      row.push(flips / 256);
    }
    matrix.push(row);
  }

  return matrix;
}

/**
 * Calculate Bit Independence Criterion - Nonlinearity (BIC-NL)
 *
 * Measures the nonlinearity of the XOR of pairs of output bits.
 *
 * Ideal value: 120
 * K44 achieves: 112
 *
 * @param sbox - 256-byte S-box
 * @returns BIC-NL value
 */
export function calculateBICNL(sbox: number[] | readonly number[]): number {
  let minNL = 120;

  // For each pair of output bits
  for (let bit1 = 0; bit1 < 8; bit1++) {
    for (let bit2 = bit1 + 1; bit2 < 8; bit2++) {
      // Create truth table for XOR of two bits
      const truthTable: number[] = [];
      for (let x = 0; x < 256; x++) {
        const b1 = (sbox[x] >> bit1) & 1;
        const b2 = (sbox[x] >> bit2) & 1;
        truthTable.push(b1 ^ b2);
      }

      // Find maximum Walsh coefficient
      let maxWalsh = 0;
      for (let mask = 0; mask < 256; mask++) {
        const coef = Math.abs(walshTransform(truthTable, mask));
        if (coef > maxWalsh) {
          maxWalsh = coef;
        }
      }

      const nl = 128 - maxWalsh / 2;
      if (nl < minNL) {
        minNL = nl;
      }
    }
  }

  return minNL;
}

/**
 * Calculate Bit Independence Criterion - SAC (BIC-SAC)
 *
 * Measures the independence between pairs of output bits
 * when an input bit is flipped.
 *
 * Ideal value: 0.5
 * K44 achieves: 0.50237
 *
 * @param sbox - 256-byte S-box
 * @returns BIC-SAC value
 */
export function calculateBICSAC(sbox: number[] | readonly number[]): number {
  let totalCorrelation = 0;
  let pairCount = 0;

  // For each pair of output bits
  for (let bit1 = 0; bit1 < 8; bit1++) {
    for (let bit2 = bit1 + 1; bit2 < 8; bit2++) {
      // For each input bit to flip
      for (let inputBit = 0; inputBit < 8; inputBit++) {
        let agreements = 0;

        for (let x = 0; x < 256; x++) {
          const xFlipped = x ^ (1 << inputBit);

          const b1Original = (sbox[x] >> bit1) & 1;
          const b1Flipped = (sbox[xFlipped] >> bit1) & 1;
          const b2Original = (sbox[x] >> bit2) & 1;
          const b2Flipped = (sbox[xFlipped] >> bit2) & 1;

          const change1 = b1Original ^ b1Flipped;
          const change2 = b2Original ^ b2Flipped;

          // Check if changes are independent (XOR should be 0.5)
          if (change1 === change2) {
            agreements++;
          }
        }

        totalCorrelation += agreements / 256;
        pairCount++;
      }
    }
  }

  return totalCorrelation / pairCount;
}

/**
 * Calculate the BIC-SAC matrix
 * Shows correlation between pairs of output bits
 *
 * @param sbox - 256-byte S-box
 * @returns 8x8 matrix (symmetric, diagonal is undefined)
 */
export function calculateBICSACMatrix(sbox: number[] | readonly number[]): (number | null)[][] {
  const matrix: (number | null)[][] = Array.from({ length: 8 }, () => new Array(8).fill(null));

  for (let bit1 = 0; bit1 < 8; bit1++) {
    for (let bit2 = bit1 + 1; bit2 < 8; bit2++) {
      let totalCorrelation = 0;

      for (let inputBit = 0; inputBit < 8; inputBit++) {
        let agreements = 0;

        for (let x = 0; x < 256; x++) {
          const xFlipped = x ^ (1 << inputBit);

          const change1 = ((sbox[x] >> bit1) & 1) ^ ((sbox[xFlipped] >> bit1) & 1);
          const change2 = ((sbox[x] >> bit2) & 1) ^ ((sbox[xFlipped] >> bit2) & 1);

          if (change1 === change2) {
            agreements++;
          }
        }

        totalCorrelation += agreements / 256;
      }

      const value = totalCorrelation / 8;
      matrix[bit1][bit2] = value;
      matrix[bit2][bit1] = value;
    }
  }

  return matrix;
}

/**
 * Calculate Linear Approximation Probability (LAP)
 *
 * Measures the maximum probability that a linear combination of input bits
 * equals a linear combination of output bits (minus 0.5).
 *
 * Formula: LAP = max |#{x : x·Γx = S(x)·Γy}/2^n - 1/2|
 *
 * Ideal value: 0 (but theoretical minimum is 2^(-n/2))
 * K44 achieves: 0.0625
 *
 * @param sbox - 256-byte S-box
 * @returns LAP value
 */
export function calculateLAP(sbox: number[] | readonly number[]): number {
  let maxBias = 0;

  // For all non-zero input and output masks
  for (let inputMask = 0; inputMask < 256; inputMask++) {
    for (let outputMask = 1; outputMask < 256; outputMask++) {
      let count = 0;

      for (let x = 0; x < 256; x++) {
        const inputParity = hammingWeight(x & inputMask) & 1;
        const outputParity = hammingWeight(sbox[x] & outputMask) & 1;

        if (inputParity === outputParity) {
          count++;
        }
      }

      const bias = Math.abs(count / 256 - 0.5);
      if (bias > maxBias) {
        maxBias = bias;
      }
    }
  }

  return maxBias;
}

/**
 * Calculate Differential Approximation Probability (DAP)
 *
 * Measures the maximum probability that an input difference results
 * in a specific output difference.
 *
 * Formula: DAP = max #{x : S(x) ⊕ S(x ⊕ Δx) = Δy}/2^n
 *
 * Ideal value: 0 (but theoretical minimum is 2^(-n+1))
 * K44 achieves: 0.015625
 *
 * @param sbox - 256-byte S-box
 * @returns DAP value
 */
export function calculateDAP(sbox: number[] | readonly number[]): number {
  let maxProb = 0;

  // For all non-zero input differences
  for (let inputDiff = 1; inputDiff < 256; inputDiff++) {
    // Count occurrences of each output difference
    const diffCounts = new Array(256).fill(0);

    for (let x = 0; x < 256; x++) {
      const outputDiff = sbox[x] ^ sbox[x ^ inputDiff];
      diffCounts[outputDiff]++;
    }

    // Find maximum count (excluding 0 output diff for non-0 input diff)
    for (let outputDiff = 0; outputDiff < 256; outputDiff++) {
      const prob = diffCounts[outputDiff] / 256;
      if (prob > maxProb) {
        maxProb = prob;
      }
    }
  }

  return maxProb;
}

/**
 * Calculate all metrics at once
 */
export interface SBoxMetrics {
  NL: number;
  SAC: number;
  BICNL: number;
  BICSAC: number;
  LAP: number;
  DAP: number;
}

export function calculateAllMetrics(sbox: number[] | readonly number[]): SBoxMetrics {
  return {
    NL: calculateNL(sbox),
    SAC: calculateSAC(sbox),
    BICNL: calculateBICNL(sbox),
    BICSAC: calculateBICSAC(sbox),
    LAP: calculateLAP(sbox),
    DAP: calculateDAP(sbox),
  };
}

/**
 * Reference values for comparison
 */
export const IDEAL_METRICS: SBoxMetrics = {
  NL: 120,
  SAC: 0.5,
  BICNL: 120,
  BICSAC: 0.5,
  LAP: 0,
  DAP: 0,
};

export const K44_EXPECTED_METRICS: SBoxMetrics = {
  NL: 112,
  SAC: 0.50073,
  BICNL: 112,
  BICSAC: 0.50237,
  LAP: 0.0625,
  DAP: 0.015625,
};

export const AES_METRICS: SBoxMetrics = {
  NL: 112,
  SAC: 0.50488,
  BICNL: 112,
  BICSAC: 0.50460,
  LAP: 0.0625,
  DAP: 0.015625,
};
