import { useState, useCallback } from 'react';
import { useProgress } from '@bprogress/next';
import { toast } from 'sonner';

interface SaveResult {
  saved: number;
  skipped: number;
  duplicates: Array<{
    discovered: string;
    existing: string;
    reason: string;
    score?: number;
  }>;
}

interface DiscoverCasinosResponse {
  ok: boolean;
  result?: SaveResult;
  error?: string;
}

interface UseDiscoverCasinosReturn {
  discoverCasinos: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  lastResult: SaveResult | null;
  reset: () => void;
}

export const useDiscoverCasinos = (): UseDiscoverCasinosReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SaveResult | null>(null);
  const { start, stop } = useProgress();

  const discoverCasinos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    start();

    try {
      const promise = (async () => {
        const response = await fetch('/api/discover-casinos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data: DiscoverCasinosResponse = await response.json();
        if (!data.ok) {
          throw new Error(data.error || 'Unknown error occurred');
        }

        if (data.result) {
          setLastResult(data.result);
        }

        return data.result;
      })();

      toast.promise(promise, {
        loading: 'Discovering casinos…',
        success: (result: SaveResult | undefined) =>
          result
            ? `Saved ${result.saved}, skipped ${result.skipped}${result.duplicates.length ? ` • ${result.duplicates.length} duplicates` : ''}`
            : 'Discovery complete',
        error: (err: any) => (err?.message ? err.message : 'Failed to discover casinos'),
      });

      await promise;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to discover casinos';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      stop();
    }
  }, [start, stop]);

  const reset = useCallback(() => {
    setError(null);
    setLastResult(null);
  }, []);

  return {
    discoverCasinos,
    isLoading,
    error,
    lastResult,
    reset,
  };
};
