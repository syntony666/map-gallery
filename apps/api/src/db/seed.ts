import { sql } from "drizzle-orm";
import { db, sqlite } from "./index";
import { areas } from "./schema";
import { areaSeedData } from "./seed-data/areas";

async function seedAreas() {
  for (const area of areaSeedData) {
    await db
      .insert(areas)
      .values(area)
      .onConflictDoUpdate({
        target: areas.id,
        set: {
          name: sql`excluded.name`,
        },
      });
  }

  console.log(`Seeded ${areaSeedData.length} areas.`);
}

try {
  await seedAreas();
} finally {
  sqlite.close();
}
