import { useState } from "react";
import { TaiwanMap } from "../components/map/TaiwanMap";
import { useViewMode } from "../hooks/useViewMode";

export function HomePage() {
  const { readonly, toggleReadonly } = useViewMode();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  return (
    <main className="map-page">
      <div className="relative mx-auto h-full max-w-7xl px-4">
        <TaiwanMap
          selectedAreaId={selectedAreaId}
          onSelectArea={setSelectedAreaId}
        />
        <button
          type="button"
          onClick={toggleReadonly}
          title={readonly ? "離開閱覽模式" : "閱覽模式"}
          className="absolute right-8 top-8 z-10 rounded bg-white px-2 py-1
            text-stone-700 shadow hover:bg-stone-50"
        >
          <i className={`bi ${readonly ? "bi-eye-slash" : "bi-eye"}`} />
        </button>
      </div>
    </main>
  );
}
