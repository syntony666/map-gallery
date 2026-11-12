import { useEffect } from "react";
import { SITE_NAME } from "@map-gallery/shared";

export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
