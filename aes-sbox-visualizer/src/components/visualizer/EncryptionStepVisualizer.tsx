import { cn } from '@/lib/utils';
import { useCryptoStore } from '@/store/useCryptoStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StateBlock } from './StateBlock';
import type { EncryptionStep } from '@/core/aes';

const operationLabels: Record<EncryptionStep['operation'], string> = {
  initial: 'Initial State',
  subBytes: 'SubBytes',
  shiftRows: 'ShiftRows',
  mixColumns: 'MixColumns',
  addRoundKey: 'AddRoundKey',
};

const operationVariants: Record<EncryptionStep['operation'], 'default' | 'input' | 'subBytes' | 'shiftRows' | 'mixColumns' | 'addRoundKey' | 'output'> = {
  initial: 'input',
  subBytes: 'subBytes',
  shiftRows: 'shiftRows',
  mixColumns: 'mixColumns',
  addRoundKey: 'addRoundKey',
};

/**
 * Step-by-step AES encryption visualizer
 * Shows all 10 rounds with intermediate states
 */
export function EncryptionStepVisualizer() {
  const {
    encryptionSteps,
    roundKeys,
    currentStepIndex,
    setCurrentStepIndex,
    nextStep,
    prevStep,
  } = useCryptoStore();

  if (encryptionSteps.length === 0) {
    return (
      <Card variant="default" className="w-full">
        <CardHeader>
          <CardTitle>Encryption Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center bg-[--color-cream-dark] border-2 border-dashed border-gray-400">
            <p className="text-gray-500 font-bold">
              No encryption in progress
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Enter plaintext and key above, then click "Encrypt with Visualization"
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStep = encryptionSteps[currentStepIndex];
  const previousStep = currentStepIndex > 0 ? encryptionSteps[currentStepIndex - 1] : null;

  // Group steps by round
  const stepsByRound: Record<number, EncryptionStep[]> = {};
  encryptionSteps.forEach((step) => {
    if (!stepsByRound[step.round]) {
      stepsByRound[step.round] = [];
    }
    stepsByRound[step.round].push(step);
  });

  return (
    <Card variant="default" className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>Encryption Steps</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
            >
              &larr; Prev
            </Button>
            <span className="px-3 py-1 font-mono text-sm bg-[--color-cream-dark] border-2 border-[--color-ink]">
              {currentStepIndex + 1} / {encryptionSteps.length}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={nextStep}
              disabled={currentStepIndex === encryptionSteps.length - 1}
            >
              Next &rarr;
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Current step info */}
        <div className="mb-4 p-3 bg-[--color-yellow] border-2 border-[--color-ink]">
          <div className="flex items-center gap-4">
            <span className="font-bold">Round {currentStep.round}</span>
            <span className="font-bold">&middot;</span>
            <span className={cn(
              'px-2 py-0.5 font-bold text-sm border-2 border-[--color-ink]',
              operationVariants[currentStep.operation] === 'subBytes' && 'bg-[--color-yellow]',
              operationVariants[currentStep.operation] === 'shiftRows' && 'bg-[--color-blue]',
              operationVariants[currentStep.operation] === 'mixColumns' && 'bg-[--color-purple]',
              operationVariants[currentStep.operation] === 'addRoundKey' && 'bg-[--color-green]',
              operationVariants[currentStep.operation] === 'input' && 'bg-[--color-cream]'
            )}>
              {operationLabels[currentStep.operation]}
            </span>
          </div>
        </div>

        {/* State visualization */}
        <div className="flex flex-wrap items-start gap-8">
          {/* Previous state */}
          {previousStep && (
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold mb-2 text-gray-500">Before</span>
              <StateBlock
                state={previousStep.state}
                variant="default"
                size="md"
              />
            </div>
          )}

          {/* Arrow */}
          {previousStep && (
            <div className="flex items-center self-center pt-6">
              <div className="text-3xl font-bold text-[--color-ink]">&rarr;</div>
            </div>
          )}

          {/* Current state */}
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold mb-2">Current</span>
            <StateBlock
              state={currentStep.state}
              variant={operationVariants[currentStep.operation]}
              highlightChanges={previousStep?.state}
              size="md"
            />
          </div>

          {/* Round key (if AddRoundKey step) */}
          {currentStep.roundKey && (
            <>
              <div className="flex items-center self-center pt-6">
                <div className="text-2xl font-bold text-[--color-ink]">&oplus;</div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold mb-2">Round Key {currentStep.round}</span>
                <StateBlock
                  state={currentStep.roundKey}
                  variant="addRoundKey"
                  size="md"
                />
              </div>
            </>
          )}
        </div>

        {/* Round timeline */}
        <div className="mt-6 pt-4 border-t-2 border-[--color-ink]">
          <div className="text-sm font-bold mb-2">Round Timeline</div>
          <div className="flex flex-wrap gap-1">
            {encryptionSteps.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={cn(
                    'w-8 h-8 text-xs font-mono font-bold border-2 border-[--color-ink]',
                    'transition-all duration-100',
                    isActive && 'ring-2 ring-[--color-ink] ring-offset-2',
                    !isActive && 'hover:shadow-[2px_2px_0_var(--color-ink)]',
                    isPast && 'bg-[--color-green]',
                    isActive && 'bg-[--color-yellow]',
                    !isPast && !isActive && 'bg-white'
                  )}
                  title={`Round ${step.round}: ${operationLabels[step.operation]}`}
                >
                  {step.round}
                </button>
              );
            })}
          </div>
        </div>

        {/* Operation description */}
        <div className="mt-4 p-3 bg-[--color-cream-dark] border-2 border-[--color-ink] text-sm">
          <p className="font-bold mb-1">
            {operationLabels[currentStep.operation]}
          </p>
          <p className="text-gray-600">
            {currentStep.operation === 'initial' && 'The initial 16-byte plaintext block arranged in a 4x4 state matrix (column-major order).'}
            {currentStep.operation === 'subBytes' && 'Each byte is replaced with its corresponding value in the S-box. This provides non-linearity.'}
            {currentStep.operation === 'shiftRows' && 'Each row is cyclically shifted: row 0 by 0, row 1 by 1, row 2 by 2, row 3 by 3 positions.'}
            {currentStep.operation === 'mixColumns' && 'Each column is multiplied by a fixed matrix in GF(2^8). This provides diffusion.'}
            {currentStep.operation === 'addRoundKey' && 'The state is XORed with the round key derived from the key schedule.'}
          </p>
        </div>

        {/* All round keys */}
        <details className="mt-4">
          <summary className="cursor-pointer font-bold p-2 bg-[--color-cream-dark] border-2 border-[--color-ink] hover:bg-[--color-yellow]">
            View All Round Keys ({roundKeys.length})
          </summary>
          <div className="mt-2 p-4 border-2 border-[--color-ink] border-t-0 overflow-x-auto">
            <div className="flex gap-4">
              {roundKeys.map((key, idx) => (
                <div key={idx} className="flex-shrink-0">
                  <StateBlock
                    state={key}
                    title={`Key ${idx}`}
                    variant={idx === currentStep.round ? 'addRoundKey' : 'default'}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
