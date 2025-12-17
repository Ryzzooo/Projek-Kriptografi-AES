# AES S-box Visualizer - User Guide

A visual tool for exploring AES encryption with custom S-boxes. Perfect for learning cryptography!

## What is This?

This application helps you understand how AES (Advanced Encryption Standard) encryption works by:
- Creating custom S-boxes (Substitution boxes) using affine transformations
- Visualizing the encryption process step-by-step
- Encrypting and decrypting text with your custom S-box

## Quick Start Guide

### 1. Understanding the S-box

An **S-box** is a lookup table used in encryption to substitute bytes. Think of it like a secret code where each letter maps to a different letter.

**How to create your S-box:**
- The affine matrix (8x8 grid of bits) and constant define your S-box
- Click on the grid squares to toggle bits (black = 1, white = 0)
- Use preset buttons: **K44** or **KAES** for standard configurations
- Or click **Randomize** for a random valid matrix

**Important:** The matrix must be valid (invertible) for encryption/decryption to work. Invalid matrices will show a red warning.

### 2. Encrypting Text

**Step-by-step:**

1. **Set up your S-box** (using the affine matrix grid)
2. Go to the **Text Encryption** card
3. Click the **🔒 Encrypt** tab
4. Enter your message in **Plaintext** (e.g., "Hello World")
5. Enter a **key** (up to 16 characters, e.g., "mysecretkey123")
6. Click **Encrypt**

**Result:** You'll see your encrypted text in two formats:
- **Hex:** For technical viewing
- **Base64:** For copying and sharing (use this for decryption!)

**Pro tip:** Click "Encrypt with Visualization" to see how AES processes your text through 10 rounds!

### 3. Decrypting Text

**Step-by-step:**

1. Copy the **Base64** ciphertext from the Encrypt tab
2. Click the **🔓 Decrypt** tab
3. Paste the Base64 ciphertext
4. Enter the **same key** you used for encryption
5. Click **Decrypt**

**Important:**
- Use the **exact same key** as encryption
- Use the **same S-box** (same affine matrix)
- If you changed the matrix after encrypting, the app remembers the original S-box from the Encrypt tab

### 4. Analyzing S-box Security

The **Metrics Panel** shows security properties of your S-box:

| Metric | What it means | Good value |
|--------|---------------|------------|
| **NL** (Nonlinearity) | How unpredictable the S-box is | Higher is better (112 is excellent) |
| **SAC** (Strict Avalanche) | How changing 1 bit affects output | Close to 0.5 (50%) |
| **LAP** (Linear Approximation) | Resistance to linear attacks | Lower is better |
| **DAP** (Differential Approximation) | Resistance to differential attacks | Lower is better |

Click **Calculate Metrics** to analyze your custom S-box.

## How AES Works (Simplified)

### The Encryption Process

1. **Input:** Your plaintext is converted to bytes
2. **Key Expansion:** Your key generates 11 "round keys"
3. **10 Rounds of transformation:**
   - **SubBytes:** Replace each byte using the S-box
   - **ShiftRows:** Shuffle bytes in each row
   - **MixColumns:** Mix bytes in each column (rounds 1-9 only)
   - **AddRoundKey:** XOR with the round key
4. **Output:** Encrypted ciphertext

### The Decryption Process

Decryption reverses the process:
- Uses inverse operations (InvSubBytes, InvShiftRows, InvMixColumns)
- Applies round keys in reverse order
- Restores the original plaintext

## Features Overview

### Affine Matrix Editor
- Interactive 8x8 bit grid
- Click to toggle individual bits
- Presets for K44 and KAES standards
- Visual validation feedback

### Text Encryption
- **Encrypt Tab:** Plaintext → Ciphertext
- **Decrypt Tab:** Ciphertext → Plaintext
- Supports any UTF-8 text
- Automatic padding (PKCS7)

### Visualization
- Step-by-step encryption process
- Shows state after each operation
- Displays round keys
- Navigate with Previous/Next buttons

### Image Encryption (if available)
- Encrypt images pixel-by-pixel
- Visual comparison of original vs encrypted
- Download encrypted images

## Tips & Best Practices

### For Learning
✅ Start with the **K44** preset to see a working configuration
✅ Try "Encrypt with Visualization" to understand each step
✅ Compare metrics between different S-boxes

### For Security
⚠️ **Never use this for real security!** This is educational software.
⚠️ ECB mode (used here) is not secure for production
⚠️ Always use the same S-box and key for decrypt as encrypt

### Troubleshooting

**"Invalid padding length" error**
- You're using a different S-box than was used for encryption
- Solution: Use the same affine matrix, or use the Decrypt tab which handles this

**"Matrix is not valid"**
- Your affine matrix cannot be inverted
- Solution: Use a preset or randomize until valid

**Decryption shows garbage**
- Wrong key or wrong S-box
- Solution: Double-check both match what you used for encryption

## Understanding the Math

### Galois Field (GF(2⁸))
- Bytes are treated as polynomials
- Special multiplication rules (no normal arithmetic!)
- Used in SubBytes and MixColumns

### Affine Transformation
Formula: `S-box[x] = M × inverse(x) + c`
- `x`: Input byte (0-255)
- `inverse(x)`: Multiplicative inverse in GF(2⁸)
- `M`: Your 8x8 affine matrix
- `c`: Constant (usually 0x63)

### Why S-boxes Matter
Good S-boxes make encryption:
- **Nonlinear:** Can't be predicted with linear equations
- **Avalanche-resistant:** Small input changes cause big output changes
- **Balanced:** Equal distribution of 0s and 1s in output

## Example Walkthrough

### Complete Encryption/Decryption Example

1. **Setup:**
   - Click **K44** preset
   - Click **Calculate Metrics** (should show NL: 112)

2. **Encrypt:**
   - Go to Encrypt tab
   - Plaintext: `Secret Message`
   - Key: `password123`
   - Click **Encrypt**
   - Copy the Base64 output (something like: `xK8hL2d...`)

3. **Decrypt:**
   - Go to Decrypt tab
   - Paste the Base64 ciphertext
   - Key: `password123`
   - Click **Decrypt**
   - Result: `Secret Message` ✓

4. **Experiment:**
   - Try changing one bit in the affine matrix
   - Encrypt the same message
   - Notice how the ciphertext is completely different!

## Keyboard Shortcuts

- **Tab:** Navigate between inputs
- **Enter:** Submit forms (where applicable)
- **Click & Drag:** In affine matrix (coming soon)

## Technical Details

- **Algorithm:** AES-128 (128-bit key, 10 rounds)
- **Mode:** ECB (Electronic Codebook)
- **Padding:** PKCS7
- **Block Size:** 16 bytes (128 bits)
- **Key Size:** 16 bytes (padded with zeros if shorter)

## Learn More

### Recommended Resources
- [NIST AES Standard](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf)
- [Understanding Cryptography by Christof Paar](http://www.crypto-textbook.com/)
- [Cryptography Course by Dan Boneh](https://www.coursera.org/learn/crypto)

### Key Concepts to Study
- Finite Fields and Galois Theory
- Block Cipher Design
- S-box Construction
- Differential and Linear Cryptanalysis

---

**Made for educational purposes** | Built with React + TypeScript | Neo-brutalism design
