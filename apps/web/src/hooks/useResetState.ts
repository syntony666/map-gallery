import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

/**
 * useState that resets to `initialValue` whenever `resetKey` changes —
 * e.g. reset page to 1 when the filter set changes, or close a menu when
 * the mode flips. The reset runs during render (React's "adjusting state
 * when props change" pattern), so no extra render is scheduled.
 */
export function useResetState<T>(
  initialValue: T | (() => T),
  resetKey: unknown,
): [T, Dispatch<SetStateAction<T>>] {
  const [key, setKey] = useState(resetKey);
  const [value, setValue] = useState(initialValue);

  if (!Object.is(key, resetKey)) {
    setKey(resetKey);
    setValue(initialValue);
  }

  return [value, setValue];
}
