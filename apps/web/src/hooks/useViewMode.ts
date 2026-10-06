import { createContext, useContext } from "react";

export const ViewModeContext = createContext<{
  readonly: boolean;
  toggleReadonly: () => void;
}>({ readonly: false, toggleReadonly: () => {} });

export function useViewMode() {
  return useContext(ViewModeContext);
}
