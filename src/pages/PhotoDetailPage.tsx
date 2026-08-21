import { useNavigate, useParams } from "react-router";
import districts from "../data/districts.json";

export function PhotoDetailPage() {
  const { districtId, itemId } = useParams();
  const navigate = useNavigate();

  const district = districts.find(
    (district) => district.districtId === districtId,
  );

  if (!district) {
    return (
      <main className="min-h-screen bg-stone-50 text-stone-800">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded px-2 py-1 text-sm hover:bg-stone-100"
          >
            ← 回到地圖
          </button>

          <section className="mt-10 text-center">
            <h1 className="text-xl font-semibold">找不到這個行政區</h1>

            <p className="mt-2 text-sm text-stone-500">
              此行政區不存在，或網址可能有誤。
            </p>
          </section>
        </div>
      </main>
    );
  }

  const item = district.items.find((item) => item.id === itemId);

  if (!item) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <button
            type="button"
            onClick={() => navigate(`/district/${district.districtId}`)}
            className="rounded px-2 py-1 text-sm hover:bg-stone-100"
          >
            ← {district.districtId} Snaps
          </button>

          <section className="mt-10 text-center">
            <h1 className="text-xl font-semibold">找不到這張照片</h1>

            <p className="mt-2 text-sm text-stone-500">
              此內容可能不存在或已被移除。
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto px-4 py-6 sm:px-6">
      <header>
        <button
          type="button"
          onClick={() => navigate(`/district/${district.districtId}`)}
          className="flex min-w-0 items-center gap-2 rounded p-2 text-xl hover:bg-stone-200"
          aria-label={`返回 ${district.districtId} Snaps`}
        >
          <div className="font-bold text-lg text-stone-700">←</div>

          <span className="min-w-0">
            <p className="truncate text-2xl font-bold sm:text-3xl text-stone-700">
              {district.districtId}
            </p>
          </span>
        </button>
      </header>

      <article className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] lg:gap-10">
        <div className="aspect-square bg-stone-950 lg:aspect-4/3">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-contain"
          />
        </div>

        <section className="lg:pt-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>

            <time className="mt-1 block text-sm text-stone-500">
              {item.date}
            </time>
          </div>

          {item.collections?.length && item.collections.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
              {item.collections.map((collection) => (
                <button
                  key={collection}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/district/${district.districtId}?collection=${encodeURIComponent(collection)}`,
                    )
                  }
                  className="text-sm text-teal-700 hover:text-teal-900"
                >
                  #{collection}
                </button>
              ))}
            </div>
          )}

          {item.summary && (
            <p className="mt-6 font-medium leading-7 text-stone-700">
              {item.summary}
            </p>
          )}

          {item.description && (
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">
              {item.description}
            </p>
          )}
        </section>
      </article>
    </main>
  );
}
