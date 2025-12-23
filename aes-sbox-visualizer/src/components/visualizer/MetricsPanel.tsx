import { cn } from '@/lib/utils';
import { useCryptoStore } from '@/store/useCryptoStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { IDEAL_METRICS, K44_EXPECTED_METRICS, AES_METRICS } from '@/core/metrics';

interface MetricRowProps {
  name: string;
  abbreviation: string;
  value: number;
  ideal: number;
  k44Value: number;
  isLowerBetter?: boolean;
  isCloserToHalfBetter?: boolean;
  precision?: number;
}

function MetricRow({
  name,
  abbreviation,
  value,
  ideal,
  k44Value,
  isLowerBetter = false,
  isCloserToHalfBetter = false,
  precision = 5,
}: MetricRowProps) {
  // Calculate quality score (0-100)
  let quality: number;
  let qualityLabel: string;

  if (isCloserToHalfBetter) {
    // For SAC-like metrics where 0.5 is ideal
    const deviation = Math.abs(value - 0.5);
    quality = Math.max(0, 100 - deviation * 200); // 0% deviation = 100, 50% deviation = 0
    qualityLabel = deviation < 0.01 ? 'Excellent' : deviation < 0.05 ? 'Good' : 'Poor';
  } else if (isLowerBetter) {
    // For LAP/DAP where lower is better
    if (ideal === 0) {
      quality = Math.max(0, 100 - value * 1000);
      qualityLabel = value <= k44Value ? 'Good' : value < 0.1 ? 'Acceptable' : 'Poor';
    } else {
      quality = ideal === 0 ? 0 : Math.max(0, (1 - value / ideal) * 100);
      qualityLabel = value <= k44Value ? 'Good' : 'Poor';
    }
  } else {
    // For NL where higher is better
    quality = (value / ideal) * 100;
    qualityLabel = value >= k44Value ? 'Good' : value >= ideal * 0.8 ? 'Acceptable' : 'Poor';
  }

  const getQualityColor = () => {
    if (qualityLabel === 'Excellent' || qualityLabel === 'Good') return 'bg-[--color-green]';
    if (qualityLabel === 'Acceptable') return 'bg-[--color-yellow]';
    return 'bg-[--color-red]';
  };

  const barWidth = Math.min(100, Math.max(0, quality));

  return (
    <div className="border-2 border-[--color-ink] p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-bold">{abbreviation}</span>
          <span className="text-sm text-gray-500 ml-2">({name})</span>
        </div>
        <span className={cn(
          'px-2 py-0.5 text-xs font-bold border border-[--color-ink]',
          getQualityColor()
        )}>
          {qualityLabel}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 border border-[--color-ink]">
            <div
              className={cn('h-full', getQualityColor())}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
        <div className="font-mono font-bold text-lg min-w-[80px] text-right">
          {value.toFixed(precision)}
        </div>
      </div>

      <div className="flex gap-4 text-xs text-gray-500">
        <span>Ideal: <span className="font-mono">{ideal.toFixed(precision)}</span></span>
        <span>K44: <span className="font-mono">{k44Value.toFixed(precision)}</span></span>
      </div>
    </div>
  );
}

export function MetricsPanel() {
  const { metrics, isCalculatingMetrics, isMatrixValid } = useCryptoStore();

  if (!isMatrixValid) {
    return (
      <Card variant="default" className="w-full">
        <CardHeader>
          <CardTitle>Cryptographic Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center bg-[--color-cream-dark] border-2 border-dashed border-gray-400">
            <p className="text-gray-500 font-bold">
              Invalid matrix - cannot calculate metrics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCalculatingMetrics || !metrics) {
    return (
      <Card variant="default" className="w-full">
        <CardHeader>
          <CardTitle>Cryptographic Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-[--color-ink] border-t-transparent rounded-full" />
            <p className="mt-4 font-bold text-gray-500">Calculating metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="default" className="w-full">
      <CardHeader>
        <CardTitle>Cryptographic Metrics</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3">
          <MetricRow
            name="Nonlinearity"
            abbreviation="NL"
            value={metrics.NL}
            ideal={IDEAL_METRICS.NL}
            k44Value={K44_EXPECTED_METRICS.NL}
            precision={0}
          />

          <MetricRow
            name="Strict Avalanche Criterion"
            abbreviation="SAC"
            value={metrics.SAC}
            ideal={IDEAL_METRICS.SAC}
            k44Value={K44_EXPECTED_METRICS.SAC}
            isCloserToHalfBetter
          />

          <MetricRow
            name="Bit Independence - Nonlinearity"
            abbreviation="BIC-NL"
            value={metrics.BICNL}
            ideal={IDEAL_METRICS.BICNL}
            k44Value={K44_EXPECTED_METRICS.BICNL}
            precision={0}
          />

          <MetricRow
            name="Bit Independence - SAC"
            abbreviation="BIC-SAC"
            value={metrics.BICSAC}
            ideal={IDEAL_METRICS.BICSAC}
            k44Value={K44_EXPECTED_METRICS.BICSAC}
            isCloserToHalfBetter
          />

          <MetricRow
            name="Linear Approximation Probability"
            abbreviation="LAP"
            value={metrics.LAP}
            ideal={IDEAL_METRICS.LAP}
            k44Value={K44_EXPECTED_METRICS.LAP}
            isLowerBetter
          />

          <MetricRow
            name="Differential Approximation Probability"
            abbreviation="DAP"
            value={metrics.DAP}
            ideal={IDEAL_METRICS.DAP}
            k44Value={K44_EXPECTED_METRICS.DAP}
            isLowerBetter
            precision={6}
          />
        </div>

        {/* Reference info */}
        <div className="mt-4 p-3 bg-[--color-cream-dark] border-2 border-[--color-ink] text-sm">
          <p className="font-bold mb-2">Metric Reference Values:</p>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div>
              <p className="font-bold text-gray-600">K44 (Paper):</p>
              <p>NL={K44_EXPECTED_METRICS.NL}, SAC={K44_EXPECTED_METRICS.SAC}</p>
              <p>LAP={K44_EXPECTED_METRICS.LAP}, DAP={K44_EXPECTED_METRICS.DAP}</p>
            </div>
            <div>
              <p className="font-bold text-gray-600">Standard AES:</p>
              <p>NL={AES_METRICS.NL}, SAC={AES_METRICS.SAC}</p>
              <p>LAP={AES_METRICS.LAP}, DAP={AES_METRICS.DAP}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
