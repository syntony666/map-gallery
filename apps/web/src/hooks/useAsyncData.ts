import { useEffect, useEffectEvent, useState } from "react";

export type AsyncStatus = "loading" | "error" | "success";

type UseAsyncDataOptions<T> = {
  /** Fallback message when the failure is not an Error. */
  errorMessage?: string;
  onData?: (data: T) => void;
};

type Entry<T> = {
  deps: readonly unknown[];
  data: T | null;
  error: string | null;
};

function sameDeps(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((item, i) => Object.is(item, b[i]));
}

/**
 * Fetches `fetcher` whenever `deps` change. `data` is null while loading or
 * after an error — check `status` (or `error`) to tell "still loading" apart
 * from "failed". `refresh()` refetches while keeping the current data on
 * screen (stale-while-revalidate); `setData` writes a value back manually.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  options: UseAsyncDataOptions<T> = {},
) {
  const { errorMessage = "無法載入資料", onData } = options;
  const [entry, setEntry] = useState<Entry<T> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const runFetch = useEffectEvent(fetcher);
  const emitData = useEffectEvent((data: T) => onData?.(data));

  useEffect(() => {
    let cancelled = false;

    runFetch()
      .then((result) => {
        if (cancelled) return;
        setEntry({ deps, data: result, error: null });
        emitData(result);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setEntry({
          deps,
          data: null,
          error: reason instanceof Error ? reason.message : errorMessage,
        });
      });

    return () => {
      cancelled = true;
    };
    // deps is the caller-declared fetch key; fetcher is an effect event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refreshKey]);

  const isCurrent = entry !== null && sameDeps(entry.deps, deps);

  const status: AsyncStatus = !isCurrent
    ? "loading"
    : entry.error !== null
      ? "error"
      : "success";

  function setData(data: T | null) {
    setEntry({ deps, data, error: null });
  }

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  return {
    status,
    data: isCurrent ? entry.data : null,
    error: isCurrent ? entry.error : null,
    setData,
    refresh,
  };
}
