import { useCallback, useEffect, useRef, useState } from "react";
import { galleryStore } from "../stores/gallery.store";
import { compressImage } from "../utils/image";

/**
 * Tracks the /uploads/ file the page sent but hasn't saved into a record
 * yet, so it gets deleted on clear/leave instead of orphaning.
 */
export function usePendingUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const pendingRef = useRef<string | null>(null);
  const ownedRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  const discardPending = useCallback(async (keepalive = false) => {
    const pending = pendingRef.current;

    if (!pending) {
      return;
    }

    pendingRef.current = null;
    await galleryStore.deleteUpload(pending, { keepalive });
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const onPageHide = () => void discardPending(true);

    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      mountedRef.current = false;
      void discardPending();
    };
  }, [discardPending]);

  /** Sets the image the loaded record already owns. */
  function setOwned(image: string | null) {
    ownedRef.current = image;
  }

  /**
   * Compresses and uploads a file, returning the /uploads/ path (or null
   * on failure/unmount). The previous pending file is deleted.
   */
  async function upload(
    file: File,
    onError: (reason: unknown) => void | Promise<void>,
  ): Promise<string | null> {
    setIsUploading(true);

    try {
      const blob = await compressImage(file);
      const { image } = await galleryStore.uploadImage(blob);

      // The page left mid-upload; the file has no owner, drop it.
      if (!mountedRef.current) {
        await galleryStore.deleteUpload(image);
        return null;
      }

      const stale = pendingRef.current;
      pendingRef.current = image;

      if (stale) {
        await galleryStore.deleteUpload(stale);
      }

      return image;
    } catch (reason) {
      if (mountedRef.current) {
        await onError(reason);
      }

      return null;
    } finally {
      if (mountedRef.current) {
        setIsUploading(false);
      }
    }
  }

  /** Deletes the pending file while it still backs the field value. */
  async function clear(currentImage: string | undefined): Promise<void> {
    const pending = pendingRef.current;

    if (pending && pending === currentImage) {
      pendingRef.current = null;
      await galleryStore.deleteUpload(pending);
    }
  }

  /**
   * Call after a successful save: the pending file is now owned by the
   * record; deletes whatever it replaced and the previously owned file.
   */
  async function settle(savedImage: string): Promise<void> {
    const pending = pendingRef.current;
    pendingRef.current = null;

    if (pending && pending !== savedImage) {
      await galleryStore.deleteUpload(pending);
    }

    const owned = ownedRef.current;
    ownedRef.current = savedImage;

    if (owned && owned !== savedImage && owned.startsWith("/uploads/")) {
      await galleryStore.deleteUpload(owned);
    }
  }

  return { isUploading, setOwned, upload, clear, settle };
}
