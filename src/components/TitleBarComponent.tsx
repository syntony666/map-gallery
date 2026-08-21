import type { TitleBarButton } from "../type/title-bar.type";

type TitleBarComponentProps = {
  districtName: string;
  onBack: () => void;
  buttons?: TitleBarButton[];
};

export function TitleBarComponent({
  districtName,
  onBack,
  buttons = [],
}: TitleBarComponentProps) {
  return (
    <header className="flex items-center gap-2">
      <button
        type="button"
        onClick={onBack}
        className="flex min-w-0 items-center gap-2 rounded p-2 text-xl hover:bg-stone-300"
        aria-label={`返回 ${districtName} Snaps`}
      >
        <span className="font-bold text-lg text-stone-700">←</span>
        <span className="min-w-0">
          <p className="truncate text-2xl font-bold sm:text-3xl text-stone-700">
            {districtName}
          </p>
        </span>
      </button>

      {buttons.length > 0 && (
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {buttons.map((button) => (
            <button
              key={button.id}
              type="button"
              onClick={button.onClick}
              disabled={button.disabled}
              className="rounded bg-stone-200 px-3 py-2 text-sm
              hover:bg-stone-300 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={button.label}
              title={button.label}
            >
              {button.icon && <i className={`bi ${button.icon} me-2`}></i>}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
