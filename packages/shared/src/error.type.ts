export type ErrorCode =
  | "AREA_ID_REQUIRED"
  | "AREA_NOT_FOUND"
  | "COLLECTION_NOT_FOUND"
  | "PHOTO_NOT_FOUND"
  | "INVALID_QUERY"
  | "INVALID_JSON"
  | "INVALID_BODY"
  | "COLLECTION_NAME_CONFLICT";

export type ErrorDataResponse = {
  error: {
    code: ErrorCode;
    message: string;
  };
};
