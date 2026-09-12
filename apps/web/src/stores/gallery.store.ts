import type {
  AreaDataResponse,
  AreaListDataResponse,
  CollectionListDataResponse,
  ErrorCode,
  ErrorDataResponse,
  PhotoDataResponse,
  PhotoListDataResponse,
} from "@map-gallery/shared";

import type {
  Area,
  Collection,
  GetPhotosQuery,
  Photo,
  PhotoDetail,
} from "../types/gallery.type";

export type PhotoListResult = {
  photos: Photo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export class GalleryStoreError extends Error {
  readonly status: number;
  readonly code: ErrorCode | undefined;

  constructor(status: number, message: string, code?: ErrorCode) {
    super(message);
    this.name = "GalleryStoreError";
    this.status = status;
    this.code = code;
  }
}

async function requestData<T>(path: string): Promise<T> {
  const response = await fetch(path);

  const body = (await response.json().catch(() => null)) as
    | T
    | ErrorDataResponse
    | null;

  if (!response.ok) {
    const errorResponse = body as ErrorDataResponse | null;

    throw new GalleryStoreError(
      response.status,
      errorResponse?.error.message ?? `Request failed: ${response.status}`,
      errorResponse?.error.code,
    );
  }

  return body as T;
}

function toPhoto(
  photo: PhotoListDataResponse["items"][number] | PhotoDataResponse,
): Photo {
  return {
    id: photo.id,
    title: photo.title,
    date: photo.takenAt,
    image: photo.image,
    summary: photo.summary ?? undefined,
    description:
      "description" in photo ? (photo.description ?? undefined) : undefined,
    collectionIds: photo.collectionIds,
  };
}

function toPhotoDetail(photo: PhotoDataResponse): PhotoDetail {
  return {
    ...toPhoto(photo),
    areaId: photo.areaId,
  };
}

function toCollection(
  collection: CollectionListDataResponse["items"][number],
): Collection {
  return {
    id: collection.id,
    name: collection.name,
    coverImage: collection.coverImage ?? undefined,
    photoCount: collection.photoCount,
  };
}

function toArea(area: AreaDataResponse): Area {
  return {
    id: area.id,
    name: area.name,
    coverImage: area.coverImage ?? undefined,
    description: area.description ?? undefined,
    photoCount: area.photoCount,
  };
}

function toSearchParams(
  values: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

async function getAreaById(areaId: string): Promise<Area> {
  const areaResponse = await requestData<AreaDataResponse>(
    `/api/v1/areas/${areaId}`,
  );

  return toArea(areaResponse);
}

async function getCollectionsByAreaId(areaId: string): Promise<Collection[]> {
  const collectionsResponse = await requestData<CollectionListDataResponse>(
    `/api/v1/collections?areaId=${areaId}`,
  );

  return collectionsResponse.items.map(toCollection);
}

async function getPhotoById(photoId: string): Promise<PhotoDetail> {
  const photoResponse = await requestData<PhotoDataResponse>(
    `/api/v1/photos/${photoId}`,
  );

  return toPhotoDetail(photoResponse);
}

async function getAreas(): Promise<Area[]> {
  const response = await requestData<AreaListDataResponse>("/api/v1/areas");

  return response.items.map(toArea);
}

async function getPhotos(query: GetPhotosQuery = {}): Promise<PhotoListResult> {
  const response = await requestData<PhotoListDataResponse>(
    `/api/v1/photos${toSearchParams({
      areaId: query.areaId,
      collectionId: query.collectionId,
      keyword: query.keyword,
      sort: query.sort,
      page: query.page,
      limit: query.limit,
    })}`,
  );

  return {
    photos: response.items.map(toPhoto),
    page: response.pagination.page,
    limit: response.pagination.limit,
    total: response.pagination.total,
    totalPages: response.pagination.totalPages,
  };
}

export const galleryStore = {
  getAreas,
  getAreaById,
  getCollectionsByAreaId,
  getPhotoById,
  getPhotos,
};
