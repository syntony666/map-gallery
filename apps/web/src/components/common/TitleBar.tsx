import type {
  ButtonActionGroup,
  ButtonGroupMobileOptions,
} from "../../types/button.type";
import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";

type TitleBarComponentProps = {
  areaName: string;
  description?: string;
  onBack: () => void;
  buttonGroup?: ButtonActionGroup[];
  mobileActions?: ButtonGroupMobileOptions;
};

export function TitleBar({
  areaName,
  description,
  onBack,
  buttonGroup = [],
  mobileActions = {},
}: TitleBarComponentProps) {
  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <Button ghost onClick={onBack} className="min-w-0">
          <i
            className="bi bi-arrow-left-short shrink-0 text-3xl leading-none
              text-stone-800"
          />

          <span className="truncate text-2xl font-bold text-stone-700 sm:text-3xl">
            {areaName}
          </span>
        </Button>

        <ButtonGroup groups={buttonGroup} {...mobileActions} />
      </div>

      {description && (
        <div className="ml-3 text-sm text-stone-500">
          <p className="flex items-start">
            <i className="bi bi-chat-square-heart" />
            <span>{description}</span>
          </p>
        </div>
      )}
    </header>
  );
}
