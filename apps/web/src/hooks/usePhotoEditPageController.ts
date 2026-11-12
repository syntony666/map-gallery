import { useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { galleryStore } from "../stores/gallery.store";
import { alertError } from "../utils/alert";
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
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [form, setForm] = useState<PhotoEditForm | null>(null);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<
    Set<string>
  >(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      alertError(reason, "新增失敗", {
        COLLECTION_NAME_CONFLICT: "已有相同名稱的相簿",
      });
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
      alertError(reason, "儲存失敗");
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
