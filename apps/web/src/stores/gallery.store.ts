import type {
  AreaDataResponse,
  AreaListDataResponse,
  BatchDeletePhotosRequest,
  CollectionDataResponse,
  CollectionListDataResponse,
  CollectionPhotosRequest,
  CreateCollectionRequest,
  CreatePhotoRequest,
  ErrorCode,
  ErrorDataResponse,
  PhotoDataResponse,
  PhotoListDataResponse,
  UpdateAreaContentRequest,
  UpdateCollectionRequest,
  UpdatePhotoRequest,
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

async function requestData<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers:
      options.body !== undefined
        ? { "Content-Type": "application/json" }
        : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

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

function toPhoto(photo: PhotoListDataResponse["items"][number]): Photo {
  return {
    id: photo.id,
    title: photo.title,
    date: photo.takenAt.slice(0, 10),
    image: photo.image,
    summary: photo.summary ?? undefined,
    collectionIds: photo.collectionIds,
  };
}

function toPhotoDetail(photo: PhotoDataResponse): PhotoDetail {
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

function toCollection(collection: CollectionDataResponse): Collection {
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

async function updateAreaContent(
  areaId: string,
  payload: UpdateAreaContentRequest,
): Promise<void> {
  await requestData(`/api/v1/areas/${areaId}/content`, {
    method: "PATCH",
    body: payload,
  });
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

async function deletePhotos(photoIds: string[]): Promise<void> {
  await requestData(`/api/v1/photos/batch-delete`, {
    method: "POST",
    body: { photoIds } satisfies BatchDeletePhotosRequest,
  });
}

async function createPhoto(payload: CreatePhotoRequest): Promise<PhotoDetail> {
  const response = await requestData<PhotoDataResponse>(`/api/v1/photos`, {
    method: "POST",
    body: payload,
  });

  return toPhotoDetail(response);
}

async function updatePhoto(
  photoId: string,
  payload: UpdatePhotoRequest,
): Promise<PhotoDetail> {
  const response = await requestData<PhotoDataResponse>(
    `/api/v1/photos/${photoId}`,
    {
      method: "PATCH",
      body: payload,
    },
  );

  return toPhotoDetail(response);
}

async function createCollection(
  payload: CreateCollectionRequest,
): Promise<Collection> {
  const response = await requestData<CollectionDataResponse>(
    `/api/v1/collections`,
    {
      method: "POST",
      body: payload,
    },
  );

  return toCollection(response);
}

async function updateCollection(
  collectionId: string,
  payload: UpdateCollectionRequest,
): Promise<Collection> {
  const response = await requestData<CollectionDataResponse>(
    `/api/v1/collections/${collectionId}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
  return toCollection(response);
}

async function deleteCollection(collectionId: string): Promise<void> {
  await requestData(`/api/v1/collections/${collectionId}`, {
    method: "DELETE",
  });
}

async function addPhotosToCollection(
  payload: CollectionPhotosRequest,
): Promise<Collection> {
  const response = await requestData<CollectionDataResponse>(
    `/api/v1/collection-photos`,
    { method: "POST", body: payload },
  );
  return toCollection(response);
}

async function removePhotosFromCollection(
  payload: CollectionPhotosRequest,
): Promise<Collection> {
  const response = await requestData<CollectionDataResponse>(
    `/api/v1/collection-photos/batch-delete`,
    { method: "POST", body: payload },
  );
  return toCollection(response);
}

export const galleryStore = {
  getAreas,
  getAreaById,
  getCollectionsByAreaId,
  getPhotoById,
  getPhotos,
  deletePhotos,
  createPhoto,
  updatePhoto,
  updateAreaContent,
  createCollection,
  updateCollection,
  deleteCollection,
  addPhotosToCollection,
  removePhotosFromCollection,
};
