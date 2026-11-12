import fs from "node:fs";
import path from "node:path";
import { SITE_NAME } from "@map-gallery/shared";
import { getAreaById } from "./data/areas";
import { getPhotoRow } from "./data/photos";

type PageMeta = {
  title: string;
  description?: string | null;
  image?: string | null;
};

let cachedIndexHtml: string | null | undefined;

function readIndexHtml(distPath: string): string | null {
  if (cachedIndexHtml === undefined) {
    try {
      cachedIndexHtml = fs.readFileSync(
        path.join(distPath, "index.html"),
        "utf8",
      );
    } catch {
      cachedIndexHtml = null;
    }
  }

  return cachedIndexHtml;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function absoluteImage(image: string | null | undefined, origin: string) {
  if (!image) {
    return null;
  }

  return /^https?:\/\//.test(image) ? image : `${origin}${image}`;
}

export function injectMeta(html: string, meta: PageMeta, url: string): string {
  const title =
    meta.title === SITE_NAME ? SITE_NAME : `${meta.title} | ${SITE_NAME}`;
  const description = meta.description?.trim() || null;
  const image = absoluteImage(meta.image, new URL(url).origin);

  const tags = [
    `<meta name="description" content="${escapeAttr(description ?? "以台灣地圖探索旅行照片。")}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    description &&
      `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    image && `<meta property="og:image" content="${escapeAttr(image)}" />`,
    image && '<meta name="twitter:card" content="summary_large_image" />',
  ].filter(Boolean);

  return html
    .replace(/<title>.*?<\/title>/, `<title>${escapeAttr(title)}</title>`)
    .replace("</head>", `  ${tags.join("\n  ")}\n</head>`);
}

export function getHomeMeta(): PageMeta {
  return {
    title: SITE_NAME,
    description: "以台灣地圖探索旅行照片。",
    image: "/maps/taiwan-land.png",
  };
}

export function getAreaMeta(areaId: string): PageMeta {
  const area = getAreaById(areaId);

  if (!area) {
    return { title: "地區" };
  }

  return {
    title: area.name,
    description: area.description,
    image: area.coverImage,
  };
}

export function getPhotoMeta(photoId: string): PageMeta {
  const photo = getPhotoRow(photoId);

  if (!photo) {
    return { title: "照片" };
  }

  return {
    title: photo.title,
    description: photo.summary ?? photo.description,
    image: photo.image,
  };
}

/** Injects per-page meta into the built index.html; falls through when dist is absent. */
export function serveMetaPage(
  distPath: string,
  meta: PageMeta,
  url: string,
): Response | null {
  const html = readIndexHtml(distPath);

  if (html === null) {
    return null;
  }

  return new Response(injectMeta(html, meta, url), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
