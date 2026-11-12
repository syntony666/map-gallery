import type {
  AreaDataResponse,
  CollectionDataResponse,
  PhotoDataResponse,
  PhotoListDataResponse,
} from "@map-gallery/shared";

import type {
  Area,
  Collection,
  Photo,
  PhotoDetail,
} from "../types/gallery.type";

export function toPhoto(photo: PhotoListDataResponse["items"][number]): Photo {
  return {
    id: photo.id,
    title: photo.title,
    date: photo.takenAt.slice(0, 10),
    image: photo.image,
    summary: photo.summary ?? undefined,
    collectionIds: photo.collectionIds,
  };
}

export function toPhotoDetail(photo: PhotoDataResponse): PhotoDetail {
  return {
    id: photo.id,
    title: photo.title,
    date: photo.takenAt.slice(0, 10),
    image: photo.image,
    summary: photo.summary ?? undefined,
    description: photo.description ?? undefined,
    collectionIds: photo.collections.map((collection) => collection.id),
    collections: photo.collections,
    areaId: photo.areaId,
  };
}

export function toCollection(collection: CollectionDataResponse): Collection {
  return {
    id: collection.id,
    name: collection.name,
    coverImage: collection.coverImage ?? undefined,
    coverPhotoId: collection.coverPhotoId ?? undefined,
    photoCount: collection.photoCount,
  };
}

export function toArea(area: AreaDataResponse): Area {
  return {
    id: area.id,
    name: area.name,
    coverImage: area.coverImage ?? undefined,
    coverPhotoId: area.coverPhotoId ?? undefined,
    description: area.description ?? undefined,
    photoCount: area.photoCount,
  };
}
