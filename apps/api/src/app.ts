import path from "node:path";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { isAdminAuthorized, requireAdmin } from "./auth";
import { areasRoute } from "./routes/areas";
import { collectionPhotosRoute } from "./routes/collection-photos";
import { collectionsRoute } from "./routes/collections";
import { photosRoute } from "./routes/photos";
import { getAreaMeta, getHomeMeta, getPhotoMeta, serveMetaPage } from "./seo";

export const app = new Hono();

app.get("/health", (context) => {
  return context.json({
    ok: true,
    service: "map-gallery-api",
  });
});

app.get("/api/v1/health", (context) => {
  return context.json({
    ok: true,
    service: "map-gallery-api",
    version: "v1",
  });
});

app.get("/api/v1/auth/check", (context) => {
  return isAdminAuthorized(context)
    ? context.body(null, 204)
    : context.body(null, 401);
});

app.use("/api/v1/*", async (context, next) => {
  if (context.req.method === "GET" || context.req.method === "HEAD") {
    return next();
  }

  return requireAdmin(context, next);
});

app.route("/api/v1/areas", areasRoute);
app.route("/api/v1/collections", collectionsRoute);
app.route("/api/v1/collection-photos", collectionPhotosRoute);
app.route("/api/v1/photos", photosRoute);

// SPA static files; /api requests are handled by the routes above
const distPath = path.resolve(import.meta.dirname, "../../web/dist");

app.get("/", (context, next) => {
  const page = serveMetaPage(distPath, getHomeMeta(), context.req.url);
  return page ?? next();
});

app.get("/area/:areaId", (context, next) => {
  const page = serveMetaPage(
    distPath,
    getAreaMeta(context.req.param("areaId")),
    context.req.url,
  );
  return page ?? next();
});

app.get("/area/:areaId/photo/:photoId", (context, next) => {
  const page = serveMetaPage(
    distPath,
    getPhotoMeta(context.req.param("photoId")),
    context.req.url,
  );
  return page ?? next();
});

app.use("/*", serveStatic({ root: distPath }));
app.get("*", serveStatic({ path: path.join(distPath, "index.html") }));
