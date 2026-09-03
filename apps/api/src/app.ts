import { Hono } from "hono";
import { areasRoute } from "./routes/areas";
import { collectionsRoute } from "./routes/collections";

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
