import { useViewMode } from "../../hooks/useViewMode";
import { ensureAdminToken } from "../../utils/auth";

type ReadonlyToggleProps = {
  className?: string;
  /** show the current mode as text next to the icon */
  label?: boolean;
};

export function ReadonlyToggle({
  className = "",
  label = false,
}: ReadonlyToggleProps) {
  const { readonly, toggleReadonly } = useViewMode();

  async function handleClick() {
    if (readonly && !(await ensureAdminToken())) {
      return;
    }

    toggleReadonly();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={readonly ? "切換為編輯模式" : "切換為閱覽模式"}
      className={`group flex items-center gap-1.5 rounded text-stone-700 ${className}`}
    >
      <i className={`bi ${readonly ? "bi-lock" : "bi-unlock"}`} />
      {label && (
        <span
          className="max-w-0 overflow-hidden whitespace-nowrap opacity-0
            transition-all group-hover:max-w-24 group-hover:opacity-100"
        >
          {readonly ? "閱覽模式" : "編輯模式"}
        </span>
      )}
    </button>
  );
}
