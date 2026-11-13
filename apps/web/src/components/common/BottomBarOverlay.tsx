import type { ReactNode } from "react";
import { Button } from "./Button";
import { FloatingCard } from "./FloatingCard";

type BottomBarOverlayProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Optional heading above the menu rows; the close button floats right. */
  title?: ReactNode;
  className?: string;
};

/** Card anchored 1rem above the bottom bar inside `BottomBarStack`. The fixed
    backdrop escapes to the viewport because no ancestor carries a backdrop
    filter. The body scrolls as a whole, matching the district panel. */
export function BottomBarOverlay({
  open,
  onClose,
  children,
  title,
  className = "",
}: BottomBarOverlayProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="關閉浮層"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
      />
      <FloatingCard
        className={[
          "absolute inset-x-0 bottom-[calc(100%_+_1rem)] flex",
          "max-h-[calc(100dvh-10rem)] flex-col overflow-hidden p-4",
          className,
        ].join(" ")}
      >
        <Button
          ghost
          icon="bi-x-lg"
          aria-label="關閉"
          onClick={onClose}
          className="absolute right-4 top-4 h-6 w-6 justify-center"
        />
        {title && (
          <p className="px-1 pb-2 pr-8 text-sm font-semibold text-stone-700">
            {title}
          </p>
        )}
        <div className="scroll-body">{children}</div>
      </FloatingCard>
    </>
  );
}
