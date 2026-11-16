import { useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { useDialogs } from "./useDialogs";
import { usePendingUpload } from "./usePendingUpload";
import { galleryStore } from "../stores/gallery.store";
import { alertMessage } from "../utils/alert";
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
  const uploads = usePendingUpload();

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
        uploads.setOwned(d?.photo?.image ?? null);
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
    const image = await uploads.upload(file, (reason) =>
      dialogs.alert(alertMessage(reason, "上傳失敗")),
    );

    if (image) {
      updateField("image", image);
    }
  }

  async function clearImage(): Promise<void> {
    await uploads.clear(form?.image);
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

      await uploads.settle(saved.image);

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
    isUploading: uploads.isUploading,
    uploadImage,
    clearImage,
    updateField,
    toggleCollection,
    createCollection,
    submit,
  };
}
