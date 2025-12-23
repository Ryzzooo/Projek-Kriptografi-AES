import { useState } from 'react';
import { useCryptoStore } from '@/store/useCryptoStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';

/**
 * Text encryption UI component
 * Encrypts text using AES-128 with the current S-box
 */
export function TextEncryptor() {
  const [activeTab, setActiveTab] = useState('encrypt');

  const {
    plaintext,
    encryptionKey,
    ciphertext,
    ciphertextInput,
    decryptedText,
    isMatrixValid,
    sbox,
    encryptionSbox,
    setPlaintext,
    setEncryptionKey,
    setCiphertextInput,
    performEncryption,
    performDecryptionFromInput,
    encryptWithVisualization,
    clearEncryptionData,
  } = useCryptoStore();

  // Check if current S-box differs from the one used for encryption
  const sboxChanged = encryptionSbox && sbox &&
    JSON.stringify(sbox) !== JSON.stringify(encryptionSbox);

  // Format ciphertext as hex string
  const ciphertextHex = ciphertext
    ? Array.from(ciphertext)
        .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
        .join(' ')
    : '';

  // Format ciphertext as Base64
  const ciphertextBase64 = ciphertext
    ? btoa(String.fromCharCode(...ciphertext))
    : '';

  return (
    <Card variant="default" className="w-full">
      <CardHeader>
        <CardTitle>Text Encryption</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="encrypt">🔒 Encrypt</Tabs.Trigger>
            <Tabs.Trigger value="decrypt">🔓 Decrypt</Tabs.Trigger>
          </Tabs.List>

          {/* ENCRYPT TAB */}
          <Tabs.Content value="encrypt">
            <div className="grid gap-4">
              {/* Plaintext input */}
              <Textarea
                id="plaintext"
                label="Plaintext"
                placeholder="Enter text to encrypt..."
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                className="min-h-[80px]"
              />

              {/* Encryption key input */}
              <Input
                id="encryption-key"
                label="Encryption Key (16 bytes max)"
                placeholder="Enter encryption key..."
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                maxLength={16}
              />

              {/* Key info */}
              <div className="text-sm text-gray-500">
                Key length: {encryptionKey.length}/16 bytes
                {encryptionKey.length < 16 && ' (will be padded with zeros)'}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={performEncryption}
                  disabled={!isMatrixValid || !plaintext || !encryptionKey}
                >
                  Encrypt
                </Button>
                <Button
                  variant="secondary"
                  onClick={encryptWithVisualization}
                  disabled={!isMatrixValid || !plaintext || !encryptionKey}
                >
                  Encrypt with Visualization
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={clearEncryptionData}
                >
                  Clear All
                </Button>
              </div>

              {/* Ciphertext output */}
              {ciphertext && (
                <div className="mt-4 p-4 bg-[--color-cream-dark] border-2 border-[--color-ink]">
                  <div className="font-bold uppercase text-sm mb-2">Ciphertext (Hex)</div>
                  <div className="font-mono text-sm break-all p-2 bg-white border-2 border-[--color-ink]">
                    {ciphertextHex}
                  </div>

                  <div className="font-bold uppercase text-sm mb-2 mt-4">Ciphertext (Base64)</div>
                  <div className="font-mono text-sm break-all p-2 bg-white border-2 border-[--color-ink]">
                    {ciphertextBase64}
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    Length: {ciphertext.length} bytes ({ciphertext.length / 16} blocks)
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-3 bg-[--color-yellow] border-2 border-[--color-ink] text-sm">
                <p className="font-bold">Important Notes:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>The S-box used for encryption is automatically stored for decryption.</li>
                  <li>Copy the Base64 ciphertext to decrypt it later in the Decrypt tab.</li>
                  <li>ECB mode is used for educational purposes - not recommended for production.</li>
                </ul>
              </div>
            </div>
          </Tabs.Content>

          {/* DECRYPT TAB */}
          <Tabs.Content value="decrypt">
            <div className="grid gap-4">
              {/* Ciphertext input */}
              <Textarea
                id="ciphertext-input"
                label="Ciphertext (Base64)"
                placeholder="Paste Base64 ciphertext here..."
                value={ciphertextInput}
                onChange={(e) => setCiphertextInput(e.target.value)}
                className="min-h-[80px]"
              />

              {/* Decryption key input */}
              <Input
                id="decryption-key"
                label="Decryption Key (16 bytes max)"
                placeholder="Enter decryption key..."
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                maxLength={16}
              />

              {/* Key info */}
              <div className="text-sm text-gray-500">
                Key length: {encryptionKey.length}/16 bytes
                {encryptionKey.length < 16 && ' (will be padded with zeros)'}
              </div>

              {/* Action button */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="success"
                  onClick={performDecryptionFromInput}
                  disabled={!isMatrixValid || !ciphertextInput || !encryptionKey}
                >
                  Decrypt
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={clearEncryptionData}
                >
                  Clear All
                </Button>
              </div>

              {/* Warning when S-box has changed */}
              {sboxChanged && ciphertext && activeTab === 'decrypt' && (
                <div className="p-3 bg-[--color-red] border-2 border-[--color-ink] text-white text-sm">
                  <p className="font-bold">⚠️ Warning: S-box Changed</p>
                  <p className="mt-1">
                    You have changed the affine matrix after encrypting. Make sure you're using the same S-box that was used for encryption.
                  </p>
                </div>
              )}

              {/* Decrypted output */}
              {decryptedText && (
                <div className={`mt-4 p-4 border-2 border-[--color-ink] ${decryptedText.startsWith('[Decryption Error') ? 'bg-[--color-red]' : 'bg-[--color-green]'}`}>
                  <div className={`font-bold uppercase text-sm mb-2 ${decryptedText.startsWith('[Decryption Error') ? 'text-white' : ''}`}>
                    {decryptedText.startsWith('[Decryption Error') ? 'Decryption Failed' : 'Decrypted Text'}
                  </div>
                  <div className="font-mono text-sm break-all p-2 bg-white border-2 border-[--color-ink]">
                    {decryptedText}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-3 bg-[--color-yellow] border-2 border-[--color-ink] text-sm">
                <p className="font-bold">Important Notes:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>You must use the <strong>same S-box and key</strong> that were used for encryption.</li>
                  <li>Paste the Base64 ciphertext from the Encrypt tab.</li>
                  <li>Make sure the affine matrix matches the one used during encryption.</li>
                </ul>
              </div>
            </div>
          </Tabs.Content>
        </Tabs>
      </CardContent>
    </Card>
  );
}
