import { useEffect, useRef, useState } from "react";

type UseAsyncDataOptions<T> = {
  /** Fallback message when the failure is not an Error. */
  errorMessage?: string;
  onData?: (data: T) => void;
};

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  options: UseAsyncDataOptions<T> = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { errorMessage = "無法載入資料", onData } = options;
  const onDataRef = useRef(onData);
  // eslint-disable-next-line react-hooks/refs
  onDataRef.current = onData;

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(null);
    setError(null);

    fetcher()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        onDataRef.current?.(result);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : errorMessage);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, error };
}
