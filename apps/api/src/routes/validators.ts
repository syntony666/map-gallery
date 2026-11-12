export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

export function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

export function isValidDateString(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}
