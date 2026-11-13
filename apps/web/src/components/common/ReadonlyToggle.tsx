import { useViewMode } from "../../hooks/useViewMode";
import { ensureAdminToken } from "../../utils/auth";

export function ReadonlyToggle({ className = "" }: { className?: string }) {
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
      title={readonly ? "管理模式" : "閱覽模式"}
      className={`rounded bg-white px-2 py-1 text-stone-700 shadow hover:bg-stone-50 ${className}`}
    >
      <i className={`bi ${readonly ? "bi-lock" : "bi-unlock"}`} />
    </button>
  );
}
