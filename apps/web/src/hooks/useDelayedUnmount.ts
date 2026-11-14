import { useEffect, useReducer, useRef } from "react";

/** Delays unmounting conditional content so a CSS exit animation can
    play. Non-null `value` passes through; when it becomes null the
    last non-null value is kept for `duration` ms, then null. Render
    while the return is non-null and mark that state as exiting —
    e.g. `useDelayedUnmount(open ? area : null)` for content that
    also needs the data during its exit. */
export function useDelayedUnmount<T>(value: T | null, duration = 180) {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const last = useRef(value);

  if (value !== null) {
    last.current = value;
  }

  useEffect(() => {
    if (value !== null) return;
    const timer = setTimeout(() => {
      last.current = null;
      forceRender();
    }, duration);
    return () => clearTimeout(timer);
  }, [value, duration]);

  return value !== null ? value : last.current;
}
