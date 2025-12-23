import { Header } from '@/components/layout/Header';
import { Section } from '@/components/layout/Section';
import { AffineMatrixGrid } from '@/components/visualizer/AffineMatrixGrid';
import { SBoxDisplay } from '@/components/visualizer/SBoxDisplay';
import { MetricsPanel } from '@/components/visualizer/MetricsPanel';
import { TextEncryptor } from '@/components/visualizer/TextEncryptor';
import { ImageEncryptor } from '@/components/visualizer/ImageEncryptor';
import { EncryptionStepVisualizer } from '@/components/visualizer/EncryptionStepVisualizer';

function App() {
  return (
    <div className="min-h-screen bg-[--color-cream]">
      <Header />

      {/* Theory Section */}
      <Section
        title="How It Works"
        description="Understanding the AES S-box construction with affine matrices"
        variant="alt"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="brutal-border bg-white p-4 brutal-shadow">
            <h3 className="font-bold text-lg mb-3">S-box Generation Formula</h3>
            <div className="font-mono bg-[--color-cream-dark] p-3 border-2 border-[--color-ink]">
              <p className="text-lg">B(X) = (K &middot; X<sup>-1</sup> + C) mod 2</p>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><strong>K</strong> = 8&times;8 affine matrix (invertible in GF(2))</li>
              <li><strong>X<sup>-1</sup></strong> = multiplicative inverse in GF(2<sup>8</sup>)</li>
              <li><strong>C</strong> = constant byte (AES uses 0x63)</li>
            </ul>
          </div>

          <div className="brutal-border bg-white p-4 brutal-shadow">
            <h3 className="font-bold text-lg mb-3">K44 Matrix</h3>
            <p className="text-sm mb-3">
              The K44 matrix from the research paper provides equivalent cryptographic
              strength to the standard AES S-box while demonstrating how alternative
              affine matrices can be used.
            </p>
            <div className="flex gap-4 text-sm">
              <div className="flex-1 p-2 bg-[--color-green] border-2 border-[--color-ink]">
                <strong>NL:</strong> 112 (same as AES)
              </div>
              <div className="flex-1 p-2 bg-[--color-blue] border-2 border-[--color-ink]">
                <strong>SAC:</strong> 0.50073 (near ideal)
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Matrix Editor Section */}
      <Section
        title="Affine Matrix Editor"
        description="Toggle bits to create your own affine matrix or load a preset"
      >
        <AffineMatrixGrid />
      </Section>

      {/* S-box Display and Metrics */}
      <Section
        title="Generated S-box"
        description="The 256-byte substitution box generated from your matrix"
        variant="alt"
      >
        <div className="grid lg:grid-cols-2 gap-6">
          <SBoxDisplay />
          <MetricsPanel />
        </div>
      </Section>

      {/* Text Encryption Section */}
      <Section
        title="Text Encryption"
        description="Encrypt text using AES-128 with your custom S-box"
      >
        <TextEncryptor />
      </Section>

      {/* Encryption Step Visualizer */}
      <Section
        title="Encryption Visualization"
        description="Step through the AES encryption process round by round"
        variant="alt"
      >
        <EncryptionStepVisualizer />
      </Section>

      {/* Image Encryption Section */}
      <Section
        title="Image Encryption"
        description="Visualize how AES encryption affects image data"
      >
        <ImageEncryptor />
      </Section>

      {/* Footer */}
      <footer className="bg-[--color-ink] text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-bold">AES S-box Modification Visualizer</p>
          <p className="text-sm mt-2 text-gray-300">
            Based on "AES S-box modification uses affine matrices exploration" by Alamsyah et al.
          </p>
          <p className="text-sm mt-1 text-gray-400">
            Educational tool for understanding AES S-box construction
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
