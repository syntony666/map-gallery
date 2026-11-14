const MAX_EDGE = 1600;
const WEBP_QUALITY = 0.85;

/** Downscales to a max-1600px-edge WebP blob, baking in EXIF orientation. */
export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Canvas is not available.");
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("壓縮圖片失敗")),
      "image/webp",
      WEBP_QUALITY,
    );
  });
}
