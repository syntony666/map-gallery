import { useRef } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { TitleBar } from "../components/common/TitleBar";
import { BottomBar } from "../components/common/BottomBar";
import { BottomBarStack } from "../components/common/BottomBarStack";
import { ButtonGroup } from "../components/common/ButtonGroup";
import { EmptyState } from "../components/common/EmptyState";
import { TextField } from "../components/common/TextField";
import { CollectionTagEditor } from "../components/photo-edit/CollectionTagEditor";
import type { ButtonActionGroup } from "../types/button.type";
import { usePhotoEditPageController } from "../hooks/usePhotoEditPageController";
import { pageBottomPad } from "../utils/layout-classes";
import { useViewMode } from "../hooks/useViewMode";

function BackToMapBar() {
  const navigate = useNavigate();
  return <TitleBar areaName="回到地圖" onBack={() => navigate("/")} />;
}

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
        <BackToMapBar />
        <EmptyState title="無法載入資料" description={error} />
      </div>
    );
  }

  if (!area || !form) {
    return (
      <div>
        <BackToMapBar />
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
        buttonGroup={titleButtons}
        mobileActions={{ mobileMode: "none", breakpoint: "lg" }}
      />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] lg:gap-10"
      >
        <div>
          <TextField
            id="photo-image"
            label="圖片網址"
            type="url"
            required
            value={form.image}
            onChange={(value) => updateField("image", value)}
          >
            <div className="mt-2 aspect-square rounded-md bg-secondary-bg lg:aspect-4/3">
              {form.image && (
                <img
                  src={form.image}
                  alt="預覽"
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          </TextField>
        </div>

        <div className="grid content-start gap-4">
          <TextField
            id="photo-title"
            label="標題"
            required
            value={form.title}
            onChange={(value) => updateField("title", value)}
          />

          <TextField
            id="photo-taken-at"
            label="拍攝日期"
            type="date"
            required
            value={form.takenAt}
            onChange={(value) => updateField("takenAt", value)}
          />

          <TextField
            id="photo-summary"
            label="簡述"
            value={form.summary}
            onChange={(value) => updateField("summary", value)}
          />

          <TextField
            id="photo-description"
            label="說明"
            multiline
            value={form.description}
            onChange={(value) => updateField("description", value)}
          />

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
