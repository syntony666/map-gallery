import path from "node:path";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { areasRoute } from "./routes/areas";
import { collectionPhotosRoute } from "./routes/collection-photos";
import { collectionsRoute } from "./routes/collections";
import { photosRoute } from "./routes/photos";

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

app.route("/api/v1/areas", areasRoute);
app.route("/api/v1/collections", collectionsRoute);
app.route("/api/v1/collection-photos", collectionPhotosRoute);
app.route("/api/v1/photos", photosRoute);

// SPA static files; /api requests are handled by the routes above
const distPath = path.resolve(import.meta.dirname, "../../web/dist");
app.use("/*", serveStatic({ root: distPath }));
app.get("*", serveStatic({ path: path.join(distPath, "index.html") }));
