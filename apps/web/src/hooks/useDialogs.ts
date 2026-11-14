import { createContext, useContext } from "react";

export type Dialogs = {
  /** Resolves when the user dismisses the dialog. */
  alert: (message: string) => Promise<void>;
  /** Resolves true on confirm, false on cancel/backdrop/Escape. */
  confirm: (message: string, options?: { danger?: boolean }) => Promise<boolean>;
  /** Resolves the trimmed input on confirm, null on cancel. */
  prompt: (message: string, defaultValue?: string) => Promise<string | null>;
};

export const DialogsContext = createContext<Dialogs>({
  alert: async () => {},
  confirm: async () => false,
  prompt: async () => null,
});

export function useDialogs() {
  return useContext(DialogsContext);
}
