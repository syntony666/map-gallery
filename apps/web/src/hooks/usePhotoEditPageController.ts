import { useEffect, useRef, useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { useDialogs } from "./useDialogs";
import { galleryStore } from "../stores/gallery.store";
import { alertMessage } from "../utils/alert";
import { compressImage } from "../utils/image";
import {
  createCollectionWithAlert,
  toggleInSet,
} from "../utils/collections";
import type { Collection, PhotoDetail } from "../types/gallery.type";

export type PhotoEditForm = {
  title: string;
  image: string;
  takenAt: string;
  summary: string;
  description: string;
};

const emptyForm: PhotoEditForm = {
  title: "",
  image: "",
  takenAt: "",
  summary: "",
  description: "",
};

type UsePhotoEditPageControllerOptions = {
  areaId?: string;
  photoId?: string;
};

export function usePhotoEditPageController({
  areaId,
  photoId,
}: UsePhotoEditPageControllerOptions) {
  const dialogs = useDialogs();
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [form, setForm] = useState<PhotoEditForm | null>(null);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<
    Set<string>
  >(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // The /uploads/ file this session sent but hasn't saved into a record
  // yet; deleted on clear/cancel/leave so it never orphans.
  const pendingUploadRef = useRef<string | null>(null);
  const originalImageRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const discardPending = (keepalive = false) => {
      const pending = pendingUploadRef.current;

      if (!pending) {
        return;
      }

      pendingUploadRef.current = null;
      void galleryStore.deleteUpload(pending, { keepalive });
    };

    const onPageHide = () => discardPending(true);

    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      mountedRef.current = false;
      discardPending();
    };
  }, []);

  const { data, error } = useAsyncData(
    () => {
      if (!areaId) {
        return Promise.resolve(null);
      }

      return Promise.all([
        photoId ? galleryStore.getPhotoById(photoId) : Promise.resolve(null),
        galleryStore.getAreaById(areaId),
        galleryStore.getCollectionsByAreaId(areaId),
      ]).then(([photo, loadedArea, loadedCollections]) => {
        if (photo && photo.areaId !== areaId) {
          throw new Error("照片不屬於此行政區");
        }
        return { photo, area: loadedArea, collections: loadedCollections };
      });
    },
    [areaId, photoId],
    {
      errorMessage: "無法載入資料",
      onData: (d) => {
        originalImageRef.current = d?.photo?.image ?? null;
        setCollections(d?.collections ?? null);
        setSelectedCollectionIds(
          new Set(
            d?.photo?.collections.map((collection) => collection.id) ?? [],
          ),
        );
        setForm(
          d?.photo
            ? {
                title: d.photo.title,
                image: d.photo.image,
                takenAt: d.photo.date,
                summary: d.photo.summary ?? "",
                description: d.photo.description ?? "",
              }
            : emptyForm,
        );
      },
    },
  );

  const area = data?.area ?? null;

  function updateField(field: keyof PhotoEditForm, value: string) {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }

  function toggleCollection(collectionId: string) {
    setSelectedCollectionIds((current) => toggleInSet(current, collectionId));
  }

  async function createCollection(name: string): Promise<Collection | null> {
    if (!areaId) {
      return null;
    }

    const created = await createCollectionWithAlert(dialogs, { areaId, name });

    if (!created) {
      return null;
    }

    setCollections((current) =>
      [...(current ?? []), created].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    );
    setSelectedCollectionIds((current) => new Set(current).add(created.id));

    return created;
  }

  async function uploadImage(file: File): Promise<void> {
    setIsUploading(true);

    try {
      const blob = await compressImage(file);
      const { image } = await galleryStore.uploadImage(blob);

      // The page left mid-upload; the file has no owner, drop it.
      if (!mountedRef.current) {
        await galleryStore.deleteUpload(image);
        return;
      }

      const stale = pendingUploadRef.current;
      pendingUploadRef.current = image;
      updateField("image", image);

      if (stale) {
        await galleryStore.deleteUpload(stale);
      }
    } catch (reason) {
      if (mountedRef.current) {
        await dialogs.alert(alertMessage(reason, "上傳失敗"));
      }
    } finally {
      if (mountedRef.current) {
        setIsUploading(false);
      }
    }
  }

  async function clearImage(): Promise<void> {
    const pending = pendingUploadRef.current;

    if (pending && pending === form?.image) {
      pendingUploadRef.current = null;
      await galleryStore.deleteUpload(pending);
    }

    updateField("image", "");
  }

  async function submit(): Promise<PhotoDetail | null> {
    if (!areaId || !form || isSubmitting) {
      return null;
    }

    setIsSubmitting(true);

    const payload = {
      title: form.title,
      image: form.image,
      takenAt: form.takenAt,
      summary: form.summary || null,
      description: form.description || null,
      collectionIds: [...selectedCollectionIds],
    };

    try {
      const saved = photoId
        ? await galleryStore.updatePhoto(photoId, payload)
        : await galleryStore.createPhoto({ areaId, ...payload });

      // The pending file is referenced by the record now; drop whatever
      // it replaced and whatever the field no longer points at.
      const pending = pendingUploadRef.current;
      pendingUploadRef.current = null;

      if (pending && pending !== saved.image) {
        await galleryStore.deleteUpload(pending);
      }

      const original = originalImageRef.current;
      originalImageRef.current = saved.image;

      if (
        original &&
        original !== saved.image &&
        original.startsWith("/uploads/")
      ) {
        await galleryStore.deleteUpload(original);
      }

      return saved;
    } catch (reason) {
      await dialogs.alert(alertMessage(reason, "儲存失敗"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    area,
    collections,
    form,
    selectedCollectionIds,
    error,
    isEditMode: Boolean(photoId),
    isSubmitting,
    isUploading,
    uploadImage,
    clearImage,
    updateField,
    toggleCollection,
    createCollection,
    submit,
  };
}
