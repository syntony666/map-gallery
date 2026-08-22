import { useLocation, useNavigate, useParams } from "react-router";
import districts from "../data/districts.json";
import { CollectionBar } from "../components/district/CollectionBar";
import { DistrictToolbar } from "../components/district/DistrictToolbar";
import { useDistrictFilters } from "../hooks/useDistrictFilters";
import { PhotoGrid } from "../components/district/PhotoGrid";
import type { TitleBarButton } from "../types/title-bar.type";
import { TitleBar } from "../components/common/TitleBar";
import type { District } from "../types/district";
import { EmptyState } from "../components/common/EmptyState";

export function DistrictPage() {
  const { districtId } = useParams();
  const { state } = useLocation();

  const district = districts.find((district) => district.id === districtId);

  if (!district) {
    return (
      <div>
        <TitleBarContent districtName="" />
        <EmptyState
          title=""
          description="目前未建立此行政區 請確認網址或聯絡管理員"
        />
      </div>
    );
  }

  return (
    <DistrictContent
      district={district}
      initialCollectionName={state.collectionName ?? ""}
    ></DistrictContent>
  );
}

type DistrictContentProps = {
  district: District;
  initialCollectionName?: string;
};

function DistrictContent({
  district,
  initialCollectionName,
}: DistrictContentProps) {
  const {
    keyword,
    setKeyword,
    sort,
    setSort,
    collectionName,
    toggleCollection,
    collectionGroup,
    visiblePhotos,
  } = useDistrictFilters(district.photos, initialCollectionName);

  const isDistrictEmpty = !district.photos.length;

  return (
    <main>
      {/* 標題列 */}
      <TitleBarContent
        description={district.description}
        districtName={district.id}
      />
      {/* 橫向圖片列 */}
      <CollectionBar
        collectionGroup={collectionGroup}
        collectionName={collectionName}
        onSelect={toggleCollection}
      ></CollectionBar>
      {/* 搜尋、篩選與排序列 */}
      <DistrictToolbar
        keyword={keyword}
        sort={sort}
        onKeywordChange={setKeyword}
        onSortChange={setSort}
      />
      {/* 景點卡片區 */}
      {isDistrictEmpty && (
        <EmptyState title="" description="你來早了 這裡什麼都沒有" />
      )}
      {!isDistrictEmpty && (
        <PhotoGrid district={district.id} photos={visiblePhotos} />
      )}
    </main>
  );
}

function TitleBarContent({
  districtName,
  description,
}: {
  districtName: string;
  description?: string;
}) {
  const navigate = useNavigate();
  const titleButtons: TitleBarButton[] = [
    {
      id: "manage",
      icon: "bi-pencil-square",
      onClick: () => {
        alert("編輯模式未實作");
      },
    },
  ];
  return (
    <TitleBar
      districtName={districtName.length !== 0 ? districtName : "回到地圖"}
      description={description}
      onBack={() => navigate("/")}
      buttons={districtName.length !== 0 ? titleButtons : undefined}
    />
  );
}
