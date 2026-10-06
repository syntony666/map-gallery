export type PageMode = "areaEdit" | "collectionEdit" | "editPhoto" | "browse";

export type TitleBarActions = {
  onEditArea?: () => void;
  onEditCollection?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  onDoneEdit?: () => void;
};
