import { useEffect, useState } from "react";
import { galleryStore, GalleryStoreError } from "../stores/gallery.store";
import type { Area, Collection, PhotoDetail } from "../types/gallery.type";

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
  const [area, setArea] = useState<Area | null>(null);
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [form, setForm] = useState<PhotoEditForm | null>(null);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<
    Set<string>
  >(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!areaId) {
      return () => {
        cancelled = true;
      };
    }

    const photoRequest = photoId
      ? galleryStore.getPhotoById(photoId)
      : Promise.resolve(null);

    Promise.all([
      photoRequest,
      galleryStore.getAreaById(areaId),
      galleryStore.getCollectionsByAreaId(areaId),
    ])
      .then(([photo, loadedArea, loadedCollections]) => {
        if (cancelled) return;

        if (photo && photo.areaId !== areaId) {
          setError("照片不屬於此行政區");
          return;
        }

        setArea(loadedArea);
        setCollections(loadedCollections);
        setSelectedCollectionIds(
          new Set(photo?.collections.map((collection) => collection.id) ?? []),
        );
        setForm(
          photo
            ? {
                title: photo.title,
                image: photo.image,
                takenAt: photo.date.slice(0, 10),
                summary: photo.summary ?? "",
                description: photo.description ?? "",
              }
            : emptyForm,
        );
      })
      .catch((reason: unknown) => {
        if (cancelled) return;

        setError(
          reason instanceof Error ? reason.message : "無法載入資料",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [areaId, photoId]);

  function updateField(field: keyof PhotoEditForm, value: string) {
    setForm((current) =>
      current ? { ...current, [field]: value } : current,
    );
  }

  function toggleCollection(collectionId: string) {
    setSelectedCollectionIds((current) => {
      const next = new Set(current);

      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }

      return next;
    });
  }

  async function createCollection(name: string): Promise<Collection | null> {
    if (!areaId) {
      return null;
    }

    try {
      const created = await galleryStore.createCollection({ areaId, name });

      setCollections((current) =>
        [...(current ?? []), created].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setSelectedCollectionIds((current) => new Set(current).add(created.id));

      return created;
    } catch (reason) {
      window.alert(
        reason instanceof GalleryStoreError &&
          reason.code === "COLLECTION_NAME_CONFLICT"
          ? "已有相同名稱的相簿"
          : reason instanceof Error
            ? reason.message
            : "新增失敗",
      );
      return null;
    }
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
      return photoId
        ? await galleryStore.updatePhoto(photoId, payload)
        : await galleryStore.createPhoto({ areaId, ...payload });
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : "儲存失敗");
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
    updateField,
    toggleCollection,
    createCollection,
    submit,
  };
}
