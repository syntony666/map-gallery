import { useViewMode } from "../../hooks/useViewMode";

export function ReadonlyToggle({ className = "" }: { className?: string }) {
  const { readonly, toggleReadonly } = useViewMode();

  return (
    <button
      type="button"
      onClick={toggleReadonly}
      title={readonly ? "離開閱覽模式" : "閱覽模式"}
      className={`rounded bg-white px-2 py-1 text-stone-700 shadow hover:bg-stone-50 ${className}`}
    >
      <i className={`bi ${readonly ? "bi-eye-slash" : "bi-eye"}`} />
    </button>
  );
}
