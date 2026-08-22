import type { TitleBarButton } from "../../types/title-bar.type";
import { Button } from "./Button";

type TitleBarComponentProps = {
  districtName: string;
  onBack: () => void;
  buttons?: TitleBarButton[];
};

export function TitleBar({
  districtName,
  onBack,
  buttons = [],
}: TitleBarComponentProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={onBack}
        className="flex min-w-0 item-center gap-2 rounded p-2 text-xl hover:bg-stone-300"
        aria-label={`返回 ${districtName} Snaps`}
      >
        <span className="min-w-0">
          <p className="truncate text-2xl font-bold sm:text-3xl text-stone-700">
            <i className="bi bi-arrow-left-short me-2" /> {districtName}
          </p>
        </span>
      </button>

      {buttons.length > 0 && (
        <div className="ml-auto flex shrink-0 item-center gap-2">
          {buttons.map((button) => (
            <Button button={button} />
          ))}
        </div>
      )}
    </header>
  );
}
