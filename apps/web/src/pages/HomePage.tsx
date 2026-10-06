import { TaiwanMap } from "../components/map/TaiwanMap";
import { useViewMode } from "../hooks/useViewMode";

export function HomePage() {
  const { readonly, toggleReadonly } = useViewMode();

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <div className="relative flex-1 min-h-0 w-full mx-auto px-4">
        <TaiwanMap />
        <button
          type="button"
          onClick={toggleReadonly}
          title={readonly ? "離開閱覽模式" : "閱覽模式"}
          className="absolute right-8 top-4 z-[1000] rounded bg-white px-2 py-1
            text-stone-700 shadow hover:bg-stone-50"
        >
          <i className={`bi ${readonly ? "bi-eye-slash" : "bi-eye"}`} />
        </button>
      </div>
    </main>
  );
}
