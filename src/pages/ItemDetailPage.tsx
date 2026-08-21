import { useNavigate, useParams } from "react-router";
import districts from "../data/districts.json";

export function ItemDetailPage() {
  const { districtId, itemId } = useParams();
  const navigate = useNavigate();

  const district = districts.find(
    (district) => district.districtId === districtId,
  );

  const item = district?.items.find((item) => item.id === itemId);

  if (!district) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-xl font-semibold">找不到這個行政區</h1>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-4 rounded bg-stone-100 px-3 py-2 text-sm"
        >
          回到地圖
        </button>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <button
          type="button"
          onClick={() => navigate(`/district/${districtId}`)}
          className="rounded bg-stone-100 px-3 py-2 text-sm"
        >
          ← 返回 {district.districtId}
        </button>

        <h1 className="mt-6 text-xl font-semibold">找不到這張照片</h1>

        <p className="mt-2 text-sm text-stone-500">
          此內容可能不存在或已被移除。
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto px-0 py-0 sm:px-6 sm:py-8">
      {/* 頁首 */}
      <header className="flex items-center gap-2 border-b border-stone-200 bg-white px-4 py-3 sm:rounded-t-xl sm:border">
        <button
          type="button"
          onClick={() => navigate(`/district/${district.districtId}`)}
          className="flex min-w-0 items-center gap-2 rounded px-1 py-1 text-left hover:bg-stone-100"
          aria-label={`返回 ${district.districtId} Snaps`}
        >
          <div className="font-bold text-lg text-stone-700">←</div>

          <span className="min-w-0">
            <span className="block truncate text-xl font-bold sm:text-2xl text-stone-700">
              {district.districtId}
            </span>
          </span>
        </button>
      </header>

      {/* 內容：手機單欄，桌機雙欄 */}
      <article className="bg-white sm:grid sm:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] sm:overflow-hidden sm:rounded-b-xl sm:border sm:border-t-0 sm:border-stone-200">
        {/* 主圖 */}
        <div className="aspect-square bg-stone-950 md:aspect-4/3">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-contain"
          />
        </div>

        {/* 文字內容 */}
        <section className="border-t border-stone-200 p-4 sm:flex sm:min-h-0 sm:flex-col sm:border-l sm:border-t-0">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold">{item.title}</h1>

                <time className="mt-1 block text-sm text-stone-500">
                  {item.date}
                </time>
              </div>
            </div>

            {item.collections?.length && item.collections?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.collections?.map((collection) => (
                  <button
                    key={collection}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/district/${district.districtId}?collection=${encodeURIComponent(collection)}`,
                      )
                    }
                    className="rounded-full bg-teal-50 px-2.5 py-1 text-xs text-teal-700 hover:bg-teal-100"
                  >
                    #{collection}
                  </button>
                ))}
              </div>
            )}

            {item.summary && (
              <p className="mt-5 font-medium leading-7 text-stone-700">
                {item.summary}
              </p>
            )}

            {item.description && (
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">
                {item.description}
              </p>
            )}
          </div>
        </section>
      </article>
    </main>
  );
}