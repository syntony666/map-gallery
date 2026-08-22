import type { TitleBarButton } from "../../types/title-bar.type";
import { Button } from "./Button";

type TitleBarComponentProps = {
  districtName: string;
  description?: string;
  onBack: () => void;
  buttons?: TitleBarButton[];
};

export function TitleBar({
  districtName,
  description,
  onBack,
  buttons = [],
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

        {buttons.length > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            {buttons.map((button) => (
              <Button button={button} />
            ))}
          </div>
        )}
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