import { MapComponent } from "../components/MapComponent";

export function HomePage() {
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <div className="sticky top-0 h-8 shrink-0 bg-white z-10">topbar</div>

      <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto px-4">
        <MapComponent />
      </div>

      <footer className="sticky bottom-0 h-8 shrink-0 bg-white z-10">
        footer
      </footer>
    </main>
  );
}
