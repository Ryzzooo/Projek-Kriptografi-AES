import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useCryptoStore } from '@/store/useCryptoStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { encryptBlock, decryptBlock } from '@/core/aes';

/**
 * Image encryption using AES-128 with custom S-box
 * Encrypts each RGB channel separately using ECB mode
 */
export function ImageEncryptor() {
  const { sbox, isMatrixValid } = useCryptoStore();

  const [imageKey, setImageKey] = useState('');
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [encryptedImage, setEncryptedImage] = useState<ImageData | null>(null);
  const [decryptedImage, setDecryptedImage] = useState<ImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const encryptedCanvasRef = useRef<HTMLCanvasElement>(null);
  const decryptedCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = originalCanvasRef.current;
        if (!canvas) return;

        // Limit size for performance
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }

        canvas.width = width;
        canvas.height = height;
        setImageDimensions({ width, height });

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        setOriginalImage(imageData);
        setEncryptedImage(null);
        setDecryptedImage(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  // Encrypt image data
  const encryptImage = useCallback(() => {
    if (!originalImage || !imageKey || !isMatrixValid) return;

    setIsProcessing(true);

    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      const encoder = new TextEncoder();
      const key = encoder.encode(imageKey.padEnd(16, '\0').slice(0, 16));

      const data = originalImage.data;
      const encrypted = new Uint8ClampedArray(data.length);

      // Process in 16-byte blocks (RGB channels, keeping alpha)
      // For simplicity, encrypt R, G, B channels in blocks
      const rgbData: number[] = [];

      // Extract RGB values
      for (let i = 0; i < data.length; i += 4) {
        rgbData.push(data[i], data[i + 1], data[i + 2]);
      }

      // Pad to multiple of 16
      while (rgbData.length % 16 !== 0) {
        rgbData.push(0);
      }

      // Encrypt
      const encryptedRgb: number[] = [];
      for (let i = 0; i < rgbData.length; i += 16) {
        const block = new Uint8Array(rgbData.slice(i, i + 16));
        const encBlock = encryptBlock(block, key, sbox);
        encryptedRgb.push(...encBlock);
      }

      // Reconstruct image data
      let rgbIdx = 0;
      for (let i = 0; i < data.length; i += 4) {
        encrypted[i] = encryptedRgb[rgbIdx++] ?? 0;     // R
        encrypted[i + 1] = encryptedRgb[rgbIdx++] ?? 0; // G
        encrypted[i + 2] = encryptedRgb[rgbIdx++] ?? 0; // B
        encrypted[i + 3] = 255;                          // Alpha (keep opaque)
      }

      const encryptedImageData = new ImageData(encrypted, originalImage.width, originalImage.height);
      setEncryptedImage(encryptedImageData);

      // Draw to canvas
      const canvas = encryptedCanvasRef.current;
      if (canvas) {
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(encryptedImageData, 0, 0);
        }
      }

      setIsProcessing(false);
    }, 10);
  }, [originalImage, imageKey, isMatrixValid, sbox]);

  // Decrypt image data
  const decryptImage = useCallback(() => {
    if (!encryptedImage || !imageKey || !isMatrixValid) return;

    setIsProcessing(true);

    setTimeout(() => {
      const encoder = new TextEncoder();
      const key = encoder.encode(imageKey.padEnd(16, '\0').slice(0, 16));

      const data = encryptedImage.data;
      const decrypted = new Uint8ClampedArray(data.length);

      // Extract RGB values
      const rgbData: number[] = [];
      for (let i = 0; i < data.length; i += 4) {
        rgbData.push(data[i], data[i + 1], data[i + 2]);
      }

      // Pad to multiple of 16
      while (rgbData.length % 16 !== 0) {
        rgbData.push(0);
      }

      // Decrypt
      const decryptedRgb: number[] = [];
      for (let i = 0; i < rgbData.length; i += 16) {
        const block = new Uint8Array(rgbData.slice(i, i + 16));
        const decBlock = decryptBlock(block, key, sbox);
        decryptedRgb.push(...decBlock);
      }

      // Reconstruct image data
      let rgbIdx = 0;
      for (let i = 0; i < data.length; i += 4) {
        decrypted[i] = decryptedRgb[rgbIdx++] ?? 0;
        decrypted[i + 1] = decryptedRgb[rgbIdx++] ?? 0;
        decrypted[i + 2] = decryptedRgb[rgbIdx++] ?? 0;
        decrypted[i + 3] = 255;
      }

      const decryptedImageData = new ImageData(decrypted, encryptedImage.width, encryptedImage.height);
      setDecryptedImage(decryptedImageData);

      // Draw to canvas
      const canvas = decryptedCanvasRef.current;
      if (canvas) {
        canvas.width = encryptedImage.width;
        canvas.height = encryptedImage.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(decryptedImageData, 0, 0);
        }
      }

      setIsProcessing(false);
    }, 10);
  }, [encryptedImage, imageKey, isMatrixValid, sbox]);

  // Download encrypted image
  const downloadEncrypted = useCallback(() => {
    const canvas = encryptedCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'encrypted-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  return (
    <Card variant="default" className="w-full">
      <CardHeader>
        <CardTitle>Image Encryption</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4">
          {/* File upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-4 border-dashed border-[--color-ink] p-8 text-center cursor-pointer',
              'hover:bg-[--color-cream-dark] transition-colors',
              originalImage && 'bg-[--color-green]/20'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="font-bold">
              {originalImage ? 'Image loaded! Click to change' : 'Click or drop image here'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports PNG, JPG (max 256x256 for performance)
            </p>
          </div>

          {/* Encryption key */}
          <Input
            id="image-key"
            label="Encryption Key (16 bytes max)"
            placeholder="Enter encryption key..."
            value={imageKey}
            onChange={(e) => setImageKey(e.target.value)}
            maxLength={16}
          />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={encryptImage}
              disabled={!originalImage || !imageKey || !isMatrixValid || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Encrypt Image'}
            </Button>
            <Button
              variant="success"
              onClick={decryptImage}
              disabled={!encryptedImage || !imageKey || !isMatrixValid || isProcessing}
            >
              Decrypt Image
            </Button>
            <Button
              variant="secondary"
              onClick={downloadEncrypted}
              disabled={!encryptedImage}
            >
              Download Encrypted
            </Button>
          </div>

          {/* Image canvases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Original */}
            <div className="flex flex-col">
              <div className="font-bold uppercase text-sm mb-2 p-2 bg-[--color-cream-dark] border-2 border-[--color-ink]">
                Original
              </div>
              <div className="border-2 border-[--color-ink] bg-[repeating-conic-gradient(#ccc_0%_25%,white_0%_50%)] bg-[length:16px_16px] min-h-[200px] flex items-center justify-center">
                <canvas
                  ref={originalCanvasRef}
                  className={cn(!originalImage && 'hidden')}
                />
                {!originalImage && (
                  <span className="text-gray-400 font-bold">No image</span>
                )}
              </div>
              {imageDimensions.width > 0 && (
                <span className="text-xs text-gray-500 mt-1">
                  {imageDimensions.width} x {imageDimensions.height}
                </span>
              )}
            </div>

            {/* Encrypted */}
            <div className="flex flex-col">
              <div className="font-bold uppercase text-sm mb-2 p-2 bg-[--color-red] text-white border-2 border-[--color-ink]">
                Encrypted
              </div>
              <div className="border-2 border-[--color-ink] bg-[repeating-conic-gradient(#ccc_0%_25%,white_0%_50%)] bg-[length:16px_16px] min-h-[200px] flex items-center justify-center">
                <canvas
                  ref={encryptedCanvasRef}
                  className={cn(!encryptedImage && 'hidden')}
                />
                {!encryptedImage && (
                  <span className="text-gray-400 font-bold">Not encrypted</span>
                )}
              </div>
            </div>

            {/* Decrypted */}
            <div className="flex flex-col">
              <div className="font-bold uppercase text-sm mb-2 p-2 bg-[--color-green] border-2 border-[--color-ink]">
                Decrypted
              </div>
              <div className="border-2 border-[--color-ink] bg-[repeating-conic-gradient(#ccc_0%_25%,white_0%_50%)] bg-[length:16px_16px] min-h-[200px] flex items-center justify-center">
                <canvas
                  ref={decryptedCanvasRef}
                  className={cn(!decryptedImage && 'hidden')}
                />
                {!decryptedImage && (
                  <span className="text-gray-400 font-bold">Not decrypted</span>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 bg-[--color-yellow] border-2 border-[--color-ink] text-sm">
            <p className="font-bold">How it works:</p>
            <p>RGB channels are extracted and encrypted in 16-byte blocks using AES-128 ECB mode with your custom S-box. This demonstrates the visual effect of encryption - notice how patterns in the encrypted image reveal ECB mode's weakness.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
