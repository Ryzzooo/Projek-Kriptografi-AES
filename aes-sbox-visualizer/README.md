# AES S-box Visualizer

An interactive educational tool for exploring AES encryption with custom S-boxes. Built with React, TypeScript, and neo-brutalism design.

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-19-blue)

## 🎯 What is This?

This application helps you learn cryptography by:
- **Creating custom S-boxes** using affine transformations
- **Visualizing AES encryption** step-by-step (10 rounds)
- **Encrypting/decrypting text** with your custom S-box
- **Analyzing S-box security** with cryptographic metrics

Perfect for students, educators, and cryptography enthusiasts!

## ✨ Features

- 🔒 **AES-128 Encryption/Decryption** with custom S-boxes
- 🎨 **Interactive Affine Matrix Editor** (8x8 bit grid)
- 📊 **Security Metrics Calculator** (NL, SAC, BIC, LAP, DAP)
- 👀 **Step-by-Step Visualization** of the encryption process
- 🖼️ **Image Encryption** (experimental)
- 🎭 **Neo-brutalism UI** with bold colors and shadows
- 📱 **Responsive Design** works on all devices

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Modern web browser

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd aes-sbox-visualizer

# Install dependencies
bun install

# Start development server
bun run dev
```

The app will open at `http://localhost:5173`

### Building for Production

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

## 📖 Usage

### Basic Workflow

1. **Create an S-box**
   - Use presets (K44, KAES) or randomize
   - Toggle bits in the affine matrix grid
   - Check if the matrix is valid (green border)

2. **Encrypt Text**
   - Go to the "🔒 Encrypt" tab
   - Enter plaintext and a key
   - Click "Encrypt"
   - Copy the Base64 ciphertext

3. **Decrypt Text**
   - Go to the "🔓 Decrypt" tab
   - Paste the Base64 ciphertext
   - Enter the same key
   - Click "Decrypt"

For detailed instructions, see [USER_GUIDE.md](./USER_GUIDE.md)

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Tabs.tsx
│   │   └── Badge.tsx
│   ├── layout/          # Layout components
│   └── visualizer/      # Main feature components
│       ├── AffineMatrixGrid.tsx
│       ├── SBoxDisplay.tsx
│       ├── TextEncryptor.tsx
│       ├── MetricsPanel.tsx
│       └── EncryptionStepVisualizer.tsx
├── core/                # Core cryptography logic
│   ├── aes.ts           # AES implementation
│   ├── sbox.ts          # S-box generation
│   ├── galois.ts        # Galois field operations
│   ├── affine.ts        # Affine transformations
│   ├── metrics.ts       # Security metrics
│   └── consts.ts        # Constants
├── store/
│   └── useCryptoStore.ts # Global state management (Zustand)
└── App.tsx              # Main application component
```

## 🔐 Cryptography Details

### Implemented Algorithms

- **AES-128** (10 rounds)
- **Custom S-box generation** via affine transformations
- **Galois Field GF(2⁸)** arithmetic
- **PKCS7 padding**

### Security Metrics

| Metric | Description | Range |
|--------|-------------|-------|
| NL | Nonlinearity | 0-112 |
| SAC | Strict Avalanche Criterion | 0-1 |
| BIC-NL | Bit Independence Nonlinearity | 0-112 |
| LAP | Linear Approximation Probability | 0-1 |
| DAP | Differential Approximation Probability | 0-1 |

### ⚠️ Important Notice

**This is educational software only!**
- ECB mode is used (not secure for production)
- Custom S-boxes may be weak
- Not audited for real-world security

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **State Management:** Zustand
- **Styling:** Tailwind CSS (custom neo-brutalism theme)
- **Build Tool:** Vite
- **Package Manager:** Bun

## 🎨 Design Philosophy

The UI follows **neo-brutalism** design:
- Bold black borders (4px)
- Hard shadows (no blur)
- Bright, contrasting colors
- Minimal rounded corners
- Brutally honest feedback

## 📚 Resources

### Learn More About AES
- [NIST AES Standard (FIPS 197)](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf)
- [AES on Wikipedia](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)
- [Understanding Cryptography](http://www.crypto-textbook.com/)

### Related Papers
- K44 S-box design methodology
- Affine transformation in cryptography
- S-box evaluation criteria

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Based on AES (Rijndael) by Joan Daemen and Vincent Rijmen
- Inspired by cryptography education resources
- Built for the Cryptography course project

## 📧 Support

For questions or issues:
- Open an issue on GitHub
- Check the [USER_GUIDE.md](./USER_GUIDE.md)
- Review the code documentation

---

**Made with ❤️ for cryptography education** | [View User Guide](./USER_GUIDE.md)
