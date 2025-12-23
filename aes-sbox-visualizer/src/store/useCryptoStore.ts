/**
 * Zustand Store for AES S-box Visualization
 * Manages matrix state, S-box generation, and encryption state
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  K44_MATRIX,
  KAES_MATRIX,
  AES_CONSTANT,
  type MatrixPreset,
} from '@/core/consts';
import { generateSBox, generateInverseSBox } from '@/core/sbox';
import { setMatrixBit, toggleMatrixBit, isMatrixValid } from '@/core/affine';
import { calculateAllMetrics, type SBoxMetrics } from '@/core/metrics';
import { encrypt, decrypt, encryptBlockWithSteps, type EncryptionStep, type State } from '@/core/aes';

interface CryptoState {
  // Matrix configuration
  affineMatrix: number[];
  constant: number;
  isMatrixValid: boolean;

  // Generated S-box (auto-regenerated when matrix changes)
  sbox: number[];
  inverseSbox: number[];

  // Metrics (auto-calculated when S-box changes)
  metrics: SBoxMetrics | null;
  isCalculatingMetrics: boolean;

  // Encryption state
  plaintext: string;
  encryptionKey: string;
  ciphertext: Uint8Array | null;
  ciphertextInput: string; // For decryption mode - user inputs base64
  decryptedText: string;
  encryptionSbox: number[] | null; // S-box used for encryption

  // Visualization state
  encryptionSteps: EncryptionStep[];
  roundKeys: State[];
  currentStepIndex: number;

  // Actions
  setMatrixBit: (row: number, col: number, value: boolean) => void;
  toggleMatrixBit: (row: number, col: number) => void;
  setMatrix: (matrix: number[]) => void;
  setConstant: (constant: number) => void;
  loadPreset: (preset: MatrixPreset) => void;
  randomizeMatrix: () => void;
  clearMatrix: () => void;

  setPlaintext: (text: string) => void;
  setEncryptionKey: (key: string) => void;
  setCiphertextInput: (text: string) => void;
  performEncryption: () => void;
  performDecryption: () => void;
  performDecryptionFromInput: () => void;
  encryptWithVisualization: () => void;

  setCurrentStepIndex: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  recalculateMetrics: () => void;
  clearEncryptionData: () => void;
}

/**
 * Generate a random valid (invertible) matrix
 */
function generateRandomValidMatrix(): number[] {
  let matrix: number[];
  let attempts = 0;
  const maxAttempts = 1000;

  do {
    matrix = Array.from({ length: 8 }, () => Math.floor(Math.random() * 256));
    attempts++;
  } while (!isMatrixValid(matrix) && attempts < maxAttempts);

  // If we couldn't find a valid random matrix, return K44
  if (!isMatrixValid(matrix)) {
    return [...K44_MATRIX];
  }

  return matrix;
}

export const useCryptoStore = create<CryptoState>()(
  subscribeWithSelector((set, get) => {
    // Helper to regenerate S-box
    const regenerateSBox = (matrix: number[], constant: number) => {
      const valid = isMatrixValid(matrix);
      if (!valid) {
        return { sbox: [], inverseSbox: [], isMatrixValid: false };
      }
      const sbox = generateSBox(matrix, constant);
      const inverseSbox = generateInverseSBox(sbox);
      return { sbox, inverseSbox, isMatrixValid: true };
    };

    // Initial state with K44 matrix
    const initialMatrix = [...K44_MATRIX];
    const initialConstant = AES_CONSTANT;
    const initialSBox = generateSBox(initialMatrix, initialConstant);
    const initialInvSBox = generateInverseSBox(initialSBox);

    return {
      // Initial state
      affineMatrix: initialMatrix,
      constant: initialConstant,
      isMatrixValid: true,
      sbox: initialSBox,
      inverseSbox: initialInvSBox,
      metrics: null,
      isCalculatingMetrics: false,
      plaintext: '',
      encryptionKey: '',
      ciphertext: null,
      ciphertextInput: '',
      decryptedText: '',
      encryptionSbox: null,
      encryptionSteps: [],
      roundKeys: [],
      currentStepIndex: 0,

      // Matrix actions
      setMatrixBit: (row, col, value) => {
        const matrix = [...get().affineMatrix];
        setMatrixBit(matrix, row, col, value);
        const { sbox, inverseSbox, isMatrixValid: valid } = regenerateSBox(matrix, get().constant);
        set({
          affineMatrix: matrix,
          sbox,
          inverseSbox,
          isMatrixValid: valid,
          metrics: null, // Clear metrics to trigger recalculation
        });
      },

      toggleMatrixBit: (row, col) => {
        const matrix = [...get().affineMatrix];
        toggleMatrixBit(matrix, row, col);
        const { sbox, inverseSbox, isMatrixValid: valid } = regenerateSBox(matrix, get().constant);
        set({
          affineMatrix: matrix,
          sbox,
          inverseSbox,
          isMatrixValid: valid,
          metrics: null,
        });
      },

      setMatrix: (matrix) => {
        const { sbox, inverseSbox, isMatrixValid: valid } = regenerateSBox(matrix, get().constant);
        set({
          affineMatrix: [...matrix],
          sbox,
          inverseSbox,
          isMatrixValid: valid,
          metrics: null,
        });
      },

      setConstant: (constant) => {
        const { sbox, inverseSbox, isMatrixValid: valid } = regenerateSBox(get().affineMatrix, constant);
        set({
          constant,
          sbox,
          inverseSbox,
          isMatrixValid: valid,
          metrics: null,
        });
      },

      loadPreset: (preset) => {
        const matrix = preset === 'K44' ? [...K44_MATRIX] : [...KAES_MATRIX];
        const { sbox, inverseSbox, isMatrixValid: valid } = regenerateSBox(matrix, AES_CONSTANT);
        set({
          affineMatrix: matrix,
          constant: AES_CONSTANT,
          sbox,
          inverseSbox,
          isMatrixValid: valid,
          metrics: null,
        });
      },

      randomizeMatrix: () => {
        const matrix = generateRandomValidMatrix();
        const { sbox, inverseSbox, isMatrixValid: valid } = regenerateSBox(matrix, get().constant);
        set({
          affineMatrix: matrix,
          sbox,
          inverseSbox,
          isMatrixValid: valid,
          metrics: null,
        });
      },

      clearMatrix: () => {
        const matrix = new Array(8).fill(0);
        set({
          affineMatrix: matrix,
          sbox: [],
          inverseSbox: [],
          isMatrixValid: false,
          metrics: null,
        });
      },

      // Encryption actions
      setPlaintext: (text) => set({ plaintext: text }),
      setEncryptionKey: (key) => set({ encryptionKey: key }),
      setCiphertextInput: (text) => set({ ciphertextInput: text }),

      performEncryption: () => {
        const { plaintext, encryptionKey, sbox, isMatrixValid: valid } = get();
        if (!valid || !plaintext || !encryptionKey) return;

        try {
          const ciphertext = encrypt(plaintext, encryptionKey, sbox);
          // Store the S-box used for encryption so decryption uses the same one
          set({ ciphertext, decryptedText: '', encryptionSbox: [...sbox] });
        } catch (error) {
          console.error('Encryption failed:', error);
        }
      },

      performDecryption: () => {
        const { ciphertext, encryptionKey, encryptionSbox } = get();
        if (!ciphertext || !encryptionKey) return;

        // Use the S-box that was used for encryption, not the current S-box
        if (!encryptionSbox || encryptionSbox.length !== 256) {
          set({ decryptedText: '[Decryption Error: No encryption S-box found. Please encrypt first.]' });
          return;
        }

        try {
          const decryptedText = decrypt(ciphertext, encryptionKey, encryptionSbox);
          set({ decryptedText });
        } catch (error) {
          console.error('Decryption failed:', error);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          set({ decryptedText: `[Decryption Error: ${errorMsg}. Make sure you use the same key used for encryption.]` });
        }
      },

      performDecryptionFromInput: () => {
        const { ciphertextInput, encryptionKey, sbox, isMatrixValid: valid } = get();
        if (!valid || !ciphertextInput || !encryptionKey) return;

        try {
          // Decode base64 to Uint8Array
          const binaryString = atob(ciphertextInput.trim());
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Decrypt using current S-box
          const decryptedText = decrypt(bytes, encryptionKey, sbox);
          set({ decryptedText, ciphertext: bytes });
        } catch (error) {
          console.error('Decryption from input failed:', error);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          set({ decryptedText: `[Decryption Error: ${errorMsg}. Make sure the ciphertext is valid Base64 and you're using the correct S-box and key.]` });
        }
      },

      encryptWithVisualization: () => {
        const { plaintext, encryptionKey, sbox, isMatrixValid: valid } = get();
        if (!valid || !plaintext || !encryptionKey) return;

        try {
          const encoder = new TextEncoder();
          // Pad to 16 bytes
          const paddedText = plaintext.padEnd(16, '\0').slice(0, 16);
          const block = encoder.encode(paddedText);
          const key = encoder.encode(encryptionKey.padEnd(16, '\0').slice(0, 16));

          const { steps, roundKeys, ciphertext } = encryptBlockWithSteps(block, key, sbox);

          set({
            encryptionSteps: steps,
            roundKeys,
            currentStepIndex: 0,
            ciphertext,
            encryptionSbox: [...sbox], // Store the S-box used for encryption
          });
        } catch (error) {
          console.error('Encryption visualization failed:', error);
        }
      },

      // Step navigation
      setCurrentStepIndex: (index) => {
        const { encryptionSteps } = get();
        if (index >= 0 && index < encryptionSteps.length) {
          set({ currentStepIndex: index });
        }
      },

      nextStep: () => {
        const { currentStepIndex, encryptionSteps } = get();
        if (currentStepIndex < encryptionSteps.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        }
      },

      prevStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      // Metrics calculation
      recalculateMetrics: () => {
        const { sbox, isMatrixValid: valid } = get();
        if (!valid || sbox.length !== 256) {
          set({ metrics: null, isCalculatingMetrics: false });
          return;
        }

        set({ isCalculatingMetrics: true });

        // Use setTimeout to avoid blocking UI
        setTimeout(() => {
          try {
            const metrics = calculateAllMetrics(sbox);
            set({ metrics, isCalculatingMetrics: false });
          } catch (error) {
            console.error('Metrics calculation failed:', error);
            set({ metrics: null, isCalculatingMetrics: false });
          }
        }, 10);
      },

      // Clear encryption data
      clearEncryptionData: () => {
        set({
          plaintext: '',
          encryptionKey: '',
          ciphertext: null,
          ciphertextInput: '',
          decryptedText: '',
          encryptionSbox: null,
        });
      },
    };
  })
);

// Auto-calculate metrics when S-box changes
useCryptoStore.subscribe(
  (state) => state.sbox,
  () => {
    // Debounce metrics calculation
    const timeoutId = setTimeout(() => {
      useCryptoStore.getState().recalculateMetrics();
    }, 100);
    return () => clearTimeout(timeoutId);
  }
);
