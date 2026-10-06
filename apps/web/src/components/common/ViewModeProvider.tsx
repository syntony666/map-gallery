import { useState } from "react";
import type { ReactNode } from "react";
import { ViewModeContext } from "../../hooks/useViewMode";

const STORAGE_KEY = "map-gallery:viewOnly";

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [readonly, setReadonly] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== "0",
  );

  function toggleReadonly() {
    setReadonly((current) => {
      localStorage.setItem(STORAGE_KEY, current ? "0" : "1");
      return !current;
    });
  }

  return (
    <ViewModeContext.Provider value={{ readonly, toggleReadonly }}>
      {children}
    </ViewModeContext.Provider>
  );
}
