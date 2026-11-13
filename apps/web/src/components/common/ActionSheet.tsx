import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ActionSheetProps = {
  open: boolean;
  title?: ReactNode;
  className?: string;
  children: ReactNode;
  onClose: () => void;
};

export function ActionSheet({
  open,
  title,
  className,
  children,
  onClose,
}: ActionSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className={`fixed inset-0 z-50 ${className ?? ""}`}>
      <button
        type="button"
        aria-label="關閉選單"
        className="absolute inset-0 cursor-default bg-black/35"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "action-sheet-title" : undefined}
        aria-label={title ? undefined : "操作選單"}
        className={[
          "absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col",
          "rounded-t-2xl bg-stone-100 shadow-2xl",
          "pb-[max(1rem,env(safe-area-inset-bottom))]",
        ].join(" ")}
      >
        <div
          className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full
            bg-stone-300"
        />

        <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-4">
          {title ? (
            <h2
              id="action-sheet-title"
              className="text-base font-semibold text-stone-800"
            >
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="rounded p-1.5 text-stone-400 hover:bg-stone-200
              hover:text-stone-600"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-3">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
