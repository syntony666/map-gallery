import { sql } from "drizzle-orm";
import { db, sqlite } from ".";
import { areaContents, photos, collections, photoCollections } from "./schema";
import {
  areaContentSeedData,
  photoSeedData,
  collectionSeedData,
  photoCollectionSeedData,
} from "./seed-data/demo-data.dev";

const now = new Date().toISOString();

function seedDevelopmentData() {
  db.transaction((tx) => {
    for (const areaContent of areaContentSeedData) {
      tx.insert(areaContents)
        .values({
          ...areaContent,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: areaContents.areaId,
          set: {
            coverImage: sql`excluded.cover_image`,
            description: sql`excluded.description`,
            updatedAt: sql`excluded.updated_at`,
          },
        })
        .run();
    }

    for (const photo of photoSeedData) {
      tx.insert(photos)
        .values({
          ...photo,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: photos.id,
          set: {
            areaId: sql`excluded.area_id`,
            title: sql`excluded.title`,
            summary: sql`excluded.summary`,
            description: sql`excluded.description`,
            image: sql`excluded.image`,
            takenAt: sql`excluded.taken_at`,
            updatedAt: sql`excluded.updated_at`,
          },
        })
        .run();
    }

    for (const collection of collectionSeedData) {
      tx.insert(collections)
        .values({
          ...collection,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: collections.id,
          set: {
            areaId: sql`excluded.area_id`,
            name: sql`excluded.name`,
            updatedAt: sql`excluded.updated_at`,
          },
        })
        .run();
    }

    for (const relation of photoCollectionSeedData) {
      tx.insert(photoCollections)
        .values({
          ...relation,
          createdAt: now,
        })
        .onConflictDoNothing()
        .run();
    }
  });
}

try {
  seedDevelopmentData();

  console.log(`Seeded ${areaContentSeedData.length} area contents.`);
  console.log(`Seeded ${photoSeedData.length} photos.`);
  console.log(`Seeded ${collectionSeedData.length} collections.`);
  console.log(`Seeded ${photoCollectionSeedData.length} photo collections.`);
} finally {
  sqlite.close();
}
