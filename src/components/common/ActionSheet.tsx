import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ActionSheetProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
};

export function ActionSheet({
  open,
  title,
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
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="關閉選單"
        className="absolute inset-0 cursor-default bg-black/35"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "操作選單"}
        className={[
          "absolute inset-x-0 bottom-0",
          "rounded-t-2xl bg-stone-100 shadow-2xl",
          "pb-[max(1rem,env(safe-area-inset-bottom))]",
        ].join(" ")}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-stone-300" />

        {title && (
          <h2 className="px-5 pb-3 pt-4 text-base font-semibold text-stone-800">
            {title}
          </h2>
        )}

        <div className="px-3">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
