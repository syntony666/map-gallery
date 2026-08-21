import { useNavigate, useParams } from "react-router";
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

  const district = districts.find((district) => district.id === districtId);

  if (!district) {
    return <TitleBarContent districtName={districtId as string} />;
  }

  return <DistrictContent district={district}></DistrictContent>;
}

type DistrictContentProps = {
  district: District;
};

function DistrictContent({ district }: DistrictContentProps) {
  const {
    keyword,
    setKeyword,
    sort,
    setSort,
    collectionName,
    toggleCollection,
    collectionGroup,
    visiblePhotos,
  } = useDistrictFilters(district.photos);

  const isDistrictEmpty = !district.photos.length;

  return (
    <div className="mx-auto px-4 py-6 sm:px-6">
      {/* 標題列 */}
      <TitleBarContent districtName={district.id} />
      <p className="truncate my-4 text-sm text-stone-600">
        {district.description}
      </p>
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
    </div>
  );
}

function TitleBarContent({ districtName }: { districtName: string }) {
  const navigate = useNavigate();
  const titleButtons: TitleBarButton[] = [
    {
      id: "manage",
      label: "編輯頁面",
      icon: "bi-pencil-square",
      onClick: () => {
        console.log("開啟管理模式");
      },
    },
    {
      id: "add-photo",
      label: "新增相片",
      icon: "bi-plus-lg",
      // onClick: () => {
      //   navigate(`/district/${district.id}/photo/new/edit`);
      // },
      onClick: () => alert("上傳功能尚未開放"),
    },
  ];
  return (
    <TitleBar
      districtName={districtName}
      onBack={() => navigate("/")}
      buttons={titleButtons}
    />
  );
}
