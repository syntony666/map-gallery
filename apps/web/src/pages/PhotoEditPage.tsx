import { useRef } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { TitleBar } from "../components/common/TitleBar";
import { BottomBar } from "../components/common/BottomBar";
import { BottomBarStack } from "../components/common/BottomBarStack";
import { ButtonGroup } from "../components/common/ButtonGroup";
import { EmptyState } from "../components/common/EmptyState";
import { FieldLabel } from "../components/common/FieldLabel";
import { CollectionTagEditor } from "../components/photo-edit/CollectionTagEditor";
import type { ButtonActionGroup } from "../types/button.type";
import { usePhotoEditPageController } from "../hooks/usePhotoEditPageController";
import { inputClassName } from "../utils/field-classes";
import { pageBottomPad } from "../utils/layout-classes";
import { useViewMode } from "../hooks/useViewMode";

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

  const { readonly } = useViewMode();

  if (readonly) {
    return <Navigate to={areaId ? `/area/${areaId}` : "/"} replace />;
  }

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
          icon: "bi-x-lg",
          variant: "danger",
          disabled: isSubmitting,
          onClick: () => navigate(-1),
        },
        {
          id: "save",
          label: "儲存",
          icon: "bi-check-lg",
          variant: "primary",
          disabled: isSubmitting,
          onClick: () => formRef.current?.requestSubmit(),
        },
      ],
    },
  ];

  return (
    <main className={`grid gap-4 ${pageBottomPad}`}>
      <TitleBar
        areaName={`${area.name} — ${isEditMode ? "編輯照片" : "新增照片"}`}
        onBack={() => navigate(-1)}
        buttonGroup={titleButtons}
        mobileActions={{ mobileMode: "none", breakpoint: "lg" }}
      />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] lg:gap-10"
      >
        <div>
          <FieldLabel htmlFor="photo-image">圖片網址</FieldLabel>
          <input
            id="photo-image"
            type="text"
            required
            value={form.image}
            onChange={(event) => updateField("image", event.target.value)}
            className={`${inputClassName} w-full`}
          />
          <div className="mt-2 aspect-square rounded-md bg-secondary-bg lg:aspect-4/3">
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
            <FieldLabel htmlFor="photo-title">標題</FieldLabel>
            <input
              id="photo-title"
              type="text"
              required
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className={`${inputClassName} w-full`}
            />
          </div>

          <div>
            <FieldLabel htmlFor="photo-taken-at">拍攝日期</FieldLabel>
            <input
              id="photo-taken-at"
              type="date"
              required
              value={form.takenAt}
              onChange={(event) => updateField("takenAt", event.target.value)}
              className={`${inputClassName} w-full`}
            />
          </div>

          <div>
            <FieldLabel htmlFor="photo-summary">簡述</FieldLabel>
            <input
              id="photo-summary"
              type="text"
              value={form.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              className={`${inputClassName} w-full`}
            />
          </div>

          <div>
            <FieldLabel htmlFor="photo-description">說明</FieldLabel>
            <textarea
              id="photo-description"
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

      <BottomBarStack className="lg:hidden">
        <BottomBar
          className="text-sm"
          actions={
            <ButtonGroup
              groups={titleButtons}
              mobileMode="inline"
              breakpoint="md"
              translucent
            />
          }
        >
          <p className="min-w-0 flex-1 truncate text-ink-muted">
            {isEditMode
              ? "編輯照片資訊：修改標題、日期、說明與相簿"
              : "新增照片：填寫標題、日期、說明與相簿"}
          </p>
        </BottomBar>
      </BottomBarStack>
    </main>
  );
}
