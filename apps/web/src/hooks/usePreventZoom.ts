import { useEffect } from "react";

/** Locks pinch and input-focus zoom by appending maximum-scale to the
    viewport meta while the page is mounted. The map page skips this so its
    native zoom keeps working. */
export function usePreventZoom() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;

    const original = meta.getAttribute("content") ?? "";
    meta.setAttribute(
      "content",
      `${original}, maximum-scale=1.0, user-scalable=no`,
    );

    return () => {
      meta.setAttribute("content", original);
    };
  }, []);
}
