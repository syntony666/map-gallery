import { TaiwanMap } from "../components/map/TaiwanMap";

export function HomePage() {
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 w-full mx-auto px-4">
        <TaiwanMap />
      </div>
    </main>
  );
}
