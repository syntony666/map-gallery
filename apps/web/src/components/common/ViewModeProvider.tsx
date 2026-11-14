import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ViewModeContext } from "../../hooks/useViewMode";

const STORAGE_KEY = "map-gallery:viewOnly";

function readStoredReadonly(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [readonly, setReadonly] = useState(readStoredReadonly);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, readonly ? "1" : "0");
    } catch {
      // Storage may be unavailable (private mode); the toggle still works
      // for the session.
    }
  }, [readonly]);

  const toggleReadonly = useCallback(() => {
    setReadonly((current) => !current);
  }, []);

  const value = useMemo(() => ({ readonly, toggleReadonly }), [
    readonly,
    toggleReadonly,
  ]);

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}
