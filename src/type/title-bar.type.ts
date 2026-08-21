export type TitleBarButton = {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: string;
};
