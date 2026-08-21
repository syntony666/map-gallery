import { useNavigate, useParams } from "react-router";
import districts from "../data/districts.json";
import { CollectionComponent } from "../components/CollectionComponent";
import { DistrictToolbarComponent } from "../components/DistrictToolbarComponent";
import { useDistrictFilters } from "../hooks/useDistrictFilters";
import { ItemListComponent } from "../components/ItemListComponent";

export function DistrictPage() {
  const { districtId } = useParams();
  const navigate = useNavigate();

  const district = districts.find(
    (district) => district.districtId === districtId,
  );
  const items = district?.items ?? [];

  const {
    keyword,
    setKeyword,
    sort,
    setSort,
    collectionName,
    toggleCollection,
    collections,
    visibleItems,
  } = useDistrictFilters(items);

  if (!district) {
    return (
      <main className="mx-auto p-6">
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

            <h1 className="text-2xl font-bold sm:text-3xl">{districtId}</h1>
          </div>

          <button
            type="button"
            onClick={() => alert("上傳功能尚未開放")}
            className="rounded bg-stone-600 px-3 py-2 text-sm text-white"
          >
            ＋ 新增照片
          </button>
        </header>
        <h1 className="mt-6 text-2xl font-bold">目前還沒有資料</h1>
      </main>
    );
  }

  return (
    <div className="mx-auto px-4 py-6 sm:px-6">
      {/* 標題列 */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex min-w-0 items-center gap-2 rounded p-2 text-xl hover:bg-stone-200"
            aria-label="回到地圖"
          >
            <div className="font-bold text-lg text-stone-700">←</div>

            <span className="min-w-0">
              <span className="block truncate text-2xl font-bold sm:text-3xl text-stone-700">
                {district.districtId}
              </span>
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => alert("上傳功能尚未開放")}
          className="rounded bg-stone-200 px-3 py-2 text-sm"
        >
          ＋ 新增照片
        </button>
      </header>

      {/* 橫向圖片列 */}
      <CollectionComponent
        collections={collections}
        collectionName={collectionName}
        onSelect={toggleCollection}
      ></CollectionComponent>

      {/* 搜尋、篩選與排序列 */}
      <DistrictToolbarComponent
        keyword={keyword}
        sort={sort}
        onKeywordChange={setKeyword}
        onSortChange={setSort}
      />

      {/* 景點卡片區 */}
      <ItemListComponent
        items={visibleItems}
        district={district.districtId}
      ></ItemListComponent>
    </div>
  );
}
