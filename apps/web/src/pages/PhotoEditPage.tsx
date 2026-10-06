import { useRef } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { TitleBar } from "../components/common/TitleBar";
import { EmptyState } from "../components/common/EmptyState";
import { CollectionTagEditor } from "../components/photo-edit/CollectionTagEditor";
import type { ButtonActionGroup } from "../types/button.type";
import { usePhotoEditPageController } from "../hooks/usePhotoEditPageController";

export function PhotoEditPage() {
  const { areaId, photoId } = useParams();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    area,
    collections,
    form,
    selectedCollectionIds,
    error,
    isEditMode,
    isSubmitting,
    updateField,
    toggleCollection,
    createCollection,
    submit,
  } = usePhotoEditPageController({ areaId, photoId });

  if (error) {
    return (
      <div>
        <TitleBar areaName="回到地圖" onBack={() => navigate("/")} />
        <EmptyState title="無法載入資料" description={error} />
      </div>
    );
  }

  if (!area || !form) {
    return (
      <div>
        <TitleBar areaName="回到地圖" onBack={() => navigate("/")} />
        <EmptyState title="載入中…" />
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const photo = await submit();

    if (photo) {
      navigate(`/area/${areaId}/photo/${photo.id}`);
    }
  }

  const titleButtons: ButtonActionGroup[] = [
    {
      id: "photo-edit",
      buttons: [
        {
          id: "cancel",
          label: "取消",
          icon: "bi-x-lg text-red-700",
          variant: "danger",
          disabled: isSubmitting,
          onClick: () => navigate(-1),
        },
        {
          id: "save",
          label: "儲存",
          icon: "bi-check-lg text-emerald-700",
          variant: "primary",
          disabled: isSubmitting,
          onClick: () => formRef.current?.requestSubmit(),
        },
      ],
    },
  ];

  const inputClassName =
    "rounded border border-stone-500 bg-white px-2 py-2 text-sm text-stone-700 outline-none";

  return (
    <main className="grid gap-4">
      <TitleBar
        areaName={`${area.name} — ${isEditMode ? "編輯照片" : "新增照片"}`}
        onBack={() => navigate(-1)}
        buttonGroup={titleButtons}
        mobileActions={{ mobileMode: "inline" }}
      />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] lg:gap-10"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            圖片網址
          </label>
          <input
            type="text"
            required
            value={form.image}
            onChange={(event) => updateField("image", event.target.value)}
            className={`${inputClassName} w-full`}
          />
          <div className="mt-2 aspect-square rounded-xl bg-stone-200 lg:aspect-4/3">
            {form.image && (
              <img
                src={form.image}
                alt="預覽"
                className="h-full w-full object-contain"
              />
            )}
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              標題
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className={`${inputClassName} w-full`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              拍攝日期
            </label>
            <input
              type="date"
              required
              value={form.takenAt}
              onChange={(event) => updateField("takenAt", event.target.value)}
              className={`${inputClassName} w-full`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              簡述
            </label>
            <input
              type="text"
              value={form.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              className={`${inputClassName} w-full`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              說明
            </label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              className={`${inputClassName} w-full`}
            />
          </div>

          {collections && (
            <CollectionTagEditor
              collections={collections}
              selectedIds={selectedCollectionIds}
              onToggle={toggleCollection}
              onCreate={createCollection}
            />
          )}
        </div>
      </form>
    </main>
  );
}
