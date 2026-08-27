import type {
  ButtonActionGroup,
  ButtonGroupMobileOptions,
} from "../../types/button.type";
import { ButtonGroup } from "./ButtonGroup";

type TitleBarComponentProps = {
  districtName: string;
  description?: string;
  onBack: () => void;
  buttonGroup?: ButtonActionGroup[];
  mobileActions?: ButtonGroupMobileOptions;
};

export function TitleBar({
  districtName,
  description,
  onBack,
  buttonGroup = [],
  mobileActions = {},
}: TitleBarComponentProps) {
  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex min-w-0 items-center gap-2 rounded p-2 text-xl hover:bg-stone-200"
        >
          <i className="bi bi-arrow-left-short shrink-0 text-3xl leading-none" />

          <span className="truncate text-2xl font-bold text-stone-700 sm:text-3xl">
            {districtName}
          </span>
        </button>

        <ButtonGroup groups={buttonGroup} {...mobileActions} />
      </div>

      {description && (
        <div className="ml-3 text-sm text-stone-500">
          <p className="flex items-start gap-2">
            <i className="bi bi-chat-square-heart mt-0.5 shrink-0" />
            <span>{description}</span>
          </p>
        </div>
      )}
    </header>
  );
}
