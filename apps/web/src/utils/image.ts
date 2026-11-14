import encWasmUrl from "@jsquash/webp/codec/enc/webp_enc.wasm?url";
import encSimdWasmUrl from "@jsquash/webp/codec/enc/webp_enc_simd.wasm?url";

const MAX_EDGE = 1600;
const WEBP_QUALITY = 0.85;

function encodeCanvas(
  canvas: HTMLCanvasElement,
  type: string,
): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(resolve, type, WEBP_QUALITY),
  );
}

/** Safari/Firefox can't canvas-encode WebP — run libwebp's WASM build instead. */
async function encodeWebpWasm(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
): Promise<Blob> {
  const { init, default: encode } = await import("@jsquash/webp/encode.js");
  await init({
    locateFile: (name: string) =>
      name.includes("simd") ? encSimdWasmUrl : encWasmUrl,
  });
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const buffer = await encode(pixels, { quality: WEBP_QUALITY * 100 });
  return new Blob([buffer], { type: "image/webp" });
}

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

  const blob = await encodeCanvas(canvas, "image/webp");
  if (blob?.type === "image/webp") {
    return blob;
  }

  try {
    return await encodeWebpWasm(context, canvas);
  } catch {
    const fallback = await encodeCanvas(canvas, "image/jpeg");
    if (!fallback) {
      throw new Error("壓縮圖片失敗");
    }
    return fallback;
  }
}
