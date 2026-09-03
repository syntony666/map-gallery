import {
  index,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const areas = sqliteTable("areas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const areaContents = sqliteTable("area_contents", {
  areaId: text("area_id")
    .primaryKey()
    .references(() => areas.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  coverImage: text("cover_image"),
  description: text("description"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const photos = sqliteTable(
  "photos",
  {
    id: text("id").primaryKey(),
    areaId: text("area_id")
      .notNull()
      .references(() => areas.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    title: text("title").notNull(),
    summary: text("summary"),
    description: text("description"),
    image: text("image").notNull(),
    takenAt: text("taken_at").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("photos_area_id_idx").on(table.areaId),
    index("photos_area_taken_at_idx").on(table.areaId, table.takenAt),
  ],
);

export const collections = sqliteTable(
  "collections",
  {
    id: text("id").primaryKey(),
    areaId: text("area_id")
      .notNull()
      .references(() => areas.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    name: text("name").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("collections_area_id_idx").on(table.areaId),
    uniqueIndex("collections_area_name_unique").on(table.areaId, table.name),
  ],
);

export const photoCollections = sqliteTable(
  "photo_collections",
  {
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    primaryKey({
      name: "photo_collections_primary_key",
      columns: [table.photoId, table.collectionId],
    }),
    index("photo_collections_collection_id_idx").on(table.collectionId),
  ],
);
