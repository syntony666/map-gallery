/** Shared chrome for text-like inputs and textareas across pages. */
export const inputClassName =
  "rounded border border-line bg-surface px-2 py-2 text-base text-ink focus-visible:outline-2 focus-visible:outline-primary";

/** Subdued chrome for controls on a glass toolbar; callers add their
    own text size (inputs use text-base, compact selects text-sm). */
export const toolbarInputClassName =
  "rounded border border-line/70 bg-page/60 px-3 py-2";

/** Bottom padding pages reserve for the floating BottomBar on small
    screens; lg and up the bar is inline so no extra space is needed. */
export const pageBottomPad = "pb-12 lg:pb-0";
