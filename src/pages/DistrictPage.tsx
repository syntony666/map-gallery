import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import districts from "../data/districts.json";
import { CollectionComponent } from "../components/CollectionComponent";
import type { Item, SortOption } from "../type/item.type";
import { DistrictToolbarComponent } from "../components/DistrictToolbarComponent";

export function DistrictPage() {
  const { districtId } = useParams();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("newest" as SortOption);
  const [collectionSelected, setCollectionSelected] = useState("");

  const district = districts.find(
    (district) => district.districtId === districtId,
  );

  const collections = useMemo(() => {
    if (!district) {
      return null;
    }

    const groups = new Map<string, Item[]>();

    district.items.forEach((item) => {
      item.collections?.forEach((collection) => {
        const items = groups.get(collection) ?? [];

        items.push(item);

        groups.set(collection, items);
      });
    });

    return Array.from(groups, ([collection, items]) => ({
      name: collection,
      items,
    }));
  }, [district]);

  const items = useMemo(() => {
    if (!district) return [];

    const filtered = district.items
      .filter((item) =>
        collectionSelected === ""
          ? true
          : item.collections?.includes(collectionSelected),
      )
      .filter((item) => {
        const content = [item.title, item.summary, item.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return content.includes(keyword.toLowerCase());
      });

    return [...filtered].sort((a, b) => {
      if (sort === "title") {
        return a.title.localeCompare(b.title, "zh-Hant");
      }

      return 0;
    });
  }, [district, keyword, sort, collectionSelected]);

  if (!district) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded bg-gray-100 px-3 py-2 text-sm"
        >
          ← 回到地圖
        </button>

        <h1 className="mt-6 text-2xl font-bold">找不到這個行政區</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* 標題列 */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded p-2 text-xl hover:bg-stone-200"
              aria-label="回到地圖"
            >
              ←
            </button>

            <h1 className="text-2xl font-bold sm:text-3xl">
              {district.districtId}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => alert("上傳功能尚未開放")}
            className="rounded bg-teal-600 px-3 py-2 text-sm text-white"
          >
            ＋ 新增照片
          </button>
        </header>

        {/* 橫向圖片列 */}
        <CollectionComponent
          collections={collections}
          onCollectionSelect={setCollectionSelected}
        ></CollectionComponent>

        {/* 搜尋、篩選與排序列 */}
        <DistrictToolbarComponent
          keyword={keyword}
          sort={sort}
          onKeywordChange={setKeyword}
          onSortChange={setSort}
        />

        {/* 景點卡片區 */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">所有景點</h2>

            <span className="text-sm text-stone-500">
              {items.length} 個項目
            </span>
          </div>

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500">
              找不到符合條件的內容
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    navigate(`/district/${district.id}/item/${item.id}`)
                  }
                  className="overflow-hidden rounded-xl bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <img
                    src={item.thumbnail || item.image}
                    alt={item.title}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />

                  <div className="p-3">
                    <h3 className="truncate font-medium">{item.title}</h3>

                    {item.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                        {item.summary}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
