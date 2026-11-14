import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";

type BottomBarStackProps = {
  children: ReactNode;
  /** Floating overlay anchored above the bar inside the same wrapper. */
  overlay?: ReactNode;
  className?: string;
  /** Render in flow at the content's end instead of fixed — sticks to the
      viewport bottom while scrolling, and hugs short pages instead of
      leaving a gap. Only for stacks that sit last in the page flow. */
  inFlow?: boolean;
};

/** The one place that owns bottom-bar placement: always fixed to the viewport,
    one bottom offset (with safe area) for every page. The visible bar's height
    drives the wrapper, so `BottomBarOverlay` can anchor structurally above. */
export function BottomBarStack({
  children,
  overlay,
  className = "",
  inFlow = false,
}: BottomBarStackProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prevCommitted = useRef(0);
  const anim = useRef<Animation | null>(null);

  /* FLIP: CSS can't transition height:auto when children swap, so tween
     the wrapper's height with WAAPI on every commit. The "to" is the
     committed height measured after canceling the live animation —
     getBoundingClientRect reads the *animated* box, so measuring while
     one runs returns its mid-flight frame. The "from" is that same
     mid-flight value when interrupted, else the last committed height.
     Exiting children are position:absolute, so committed height always
     reflects the live bar only. */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const running = anim.current?.playState === "running";
    const visual = el.getBoundingClientRect().height;
    anim.current?.cancel();
    const committed = el.getBoundingClientRect().height;
    const prev = prevCommitted.current;
    prevCommitted.current = committed;
    if (!prev) return;
    const from = running ? visual : prev;
    if (
      from === committed ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    el.style.overflow = "hidden";
    const next = el.animate(
      [{ height: `${from}px` }, { height: `${committed}px` }],
      { duration: 160, easing: "ease" },
    );
    anim.current = next;
    next.finished
      .catch(() => {})
      .finally(() => {
        if (anim.current === next) el.style.overflow = "";
      });
  });

  return (
    <div
      ref={ref}
      className={[
        inFlow ? "sticky z-50 mx-4" : "fixed inset-x-4 z-50",
        "bottom-[calc(0.5rem+env(safe-area-inset-bottom))]",
        className,
      ].join(" ")}
    >
      {overlay}
      {children}
    </div>
  );
}
