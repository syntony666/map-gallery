import { Button } from "./Button";
import { FloatingCard } from "./FloatingCard";
import { MenuHeading, MenuList } from "./MenuList";
import type { MenuSection } from "../../types/menu.type";

type BottomBarOverlayProps = {
  open: boolean;
  onClose: () => void;
  /** Heading row of the menu (icon optional via titleIcon). */
  title: string;
  titleIcon?: string;
  sections: MenuSection[];
  /** Thin rules between rows (long lists like the region menu). */
  dividers?: boolean;
  className?: string;
};

/** Menu card anchored 1rem above the bottom bar inside `BottomBarStack`. The
    fixed backdrop escapes to the viewport because no ancestor carries a
    backdrop filter. The body scrolls as a whole, matching the district panel. */
export function BottomBarOverlay({
  open,
  onClose,
  title,
  titleIcon,
  sections,
  dividers,
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
          "max-h-[calc(100dvh-10rem)] flex-col overflow-hidden py-2 px-2 md:left-auto md:w-72",
          className,
        ].join(" ")}
      >
        <Button
          ghost
          icon="bi-x-lg"
          aria-label="關閉"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 h-6 w-6 text-stone-600 justify-center"
        />
        <MenuHeading title={title} titleIcon={titleIcon} />
        <div className="scroll-body">
          <MenuList
            sections={sections}
            dividers={dividers}
            onSelect={onClose}
          />
        </div>
      </FloatingCard>
    </>
  );
}
