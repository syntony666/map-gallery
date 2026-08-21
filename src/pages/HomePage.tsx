import { MapComponent } from "../components/MapComponent";

export function HomePage() {
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto px-4">
        <MapComponent />
      </div>
    </main>
  );
}
