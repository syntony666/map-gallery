import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { DialogsContext } from "../../hooks/useDialogs";
import { useDelayedUnmount } from "../../hooks/useDelayedUnmount";
import { inputClassName } from "../../utils/ui-classes";
import { Button } from "./Button";
import { FloatingCard } from "./FloatingCard";

type PendingDialog =
  | { id: number; kind: "alert"; message: string; resolve: () => void }
  | {
      id: number;
      kind: "confirm";
      message: string;
      danger?: boolean;
      resolve: (value: boolean) => void;
    }
  | {
      id: number;
      kind: "prompt";
      message: string;
      defaultValue?: string;
      resolve: (value: string | null) => void;
    };

let nextDialogId = 0;

export function DialogProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<PendingDialog[]>([]);
  const current = queue[0] ?? null;
  const mounted = useDelayedUnmount(current);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const dialogOpen = mounted !== null;
  useEffect(() => {
    if (!dialogOpen) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    return () => {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [dialogOpen]);

  function dismiss(value: unknown) {
    (current?.resolve as ((v: unknown) => void) | undefined)?.(value);
    setQueue((q) => q.slice(1));
  }

  function cancel() {
    dismiss(mounted?.kind === "confirm" ? false : null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      cancel();
      return;
    }
    if (event.key !== "Tab" || !overlayRef.current) return;
    const focusables = overlayRef.current.querySelectorAll<HTMLElement>(
      "button, input, [tabindex]",
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  }

  const alert = useCallback(
    (message: string) =>
      new Promise<void>((resolve) =>
        setQueue((q) => [
          ...q,
          { id: nextDialogId++, kind: "alert", message, resolve },
        ]),
      ),
    [],
  );

  const confirm = useCallback(
    (message: string, options?: { danger?: boolean }) =>
      new Promise<boolean>((resolve) =>
        setQueue((q) => [
          ...q,
          {
            id: nextDialogId++,
            kind: "confirm",
            message,
            danger: options?.danger,
            resolve,
          },
        ]),
      ),
    [],
  );

  const prompt = useCallback(
    (message: string, defaultValue?: string) =>
      new Promise<string | null>((resolve) =>
        setQueue((q) => [
          ...q,
          { id: nextDialogId++, kind: "prompt", message, defaultValue, resolve },
        ]),
      ),
    [],
  );

  const dialogs = useMemo(() => ({ alert, confirm, prompt }), [
    alert,
    confirm,
    prompt,
  ]);

  return (
    <DialogsContext.Provider value={dialogs}>
      {children}
      {mounted && (
        <div
          ref={overlayRef}
          onKeyDown={handleKeyDown}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            current ? "overlay-enter" : "overlay-exit"
          }`}
        >
          <button
            type="button"
            aria-label="關閉對話框"
            className="absolute inset-0 cursor-default bg-ink/20"
            onClick={cancel}
          />
          <FloatingCard className="relative w-full max-w-sm p-4">
            <div
              role={mounted.kind === "prompt" ? "dialog" : "alertdialog"}
              aria-modal="true"
              aria-labelledby={`dialog-message-${mounted.id}`}
            >
              <DialogBody
                key={mounted.id}
                dialog={mounted}
                dismiss={dismiss}
              />
            </div>
          </FloatingCard>
        </div>
      )}
    </DialogsContext.Provider>
  );
}

function DialogBody({
  dialog,
  dismiss,
}: {
  dialog: PendingDialog;
  dismiss: (value: unknown) => void;
}) {
  const messageId = `dialog-message-${dialog.id}`;

  if (dialog.kind === "alert") {
    return (
      <>
        <p id={messageId} className="text-sm text-ink">
          {dialog.message}
        </p>
        <div className="mt-4 flex justify-end">
          <Button
            variant="primary"
            label="確定"
            onClick={() => dismiss(undefined)}
            autoFocus
          />
        </div>
      </>
    );
  }

  if (dialog.kind === "confirm") {
    return (
      <>
        <p id={messageId} className="text-sm text-ink">
          {dialog.message}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button label="取消" ghost onClick={() => dismiss(false)} />
          <Button
            variant={dialog.danger ? "danger" : "primary"}
            label="確定"
            onClick={() => dismiss(true)}
            autoFocus
          />
        </div>
      </>
    );
  }

  return <PromptBody dialog={dialog} dismiss={dismiss} />;
}

function PromptBody({
  dialog,
  dismiss,
}: {
  dialog: PendingDialog & { kind: "prompt" };
  dismiss: (value: string | null) => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem(
      "dialog-input",
    ) as HTMLInputElement;
    dismiss(input.value.trim() || null);
  }

  const messageId = `dialog-message-${dialog.id}`;
  const inputId = `dialog-input-${dialog.id}`;

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={inputId} id={messageId} className="text-sm text-ink">
        {dialog.message}
      </label>
      <input
        id={inputId}
        name="dialog-input"
        type="text"
        defaultValue={dialog.defaultValue}
        autoFocus
        className={`${inputClassName} mt-3 w-full`}
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button
          label="取消"
          ghost
          onClick={() => dismiss(null)}
        />
        <Button variant="primary" label="確定" type="submit" />
      </div>
    </form>
  );
}
