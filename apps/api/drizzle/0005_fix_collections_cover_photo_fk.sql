-- 0001 added collections.cover_photo_id without ON DELETE/ON UPDATE actions
-- (drizzle-kit dropped the clauses from the generated ALTER). Rebuild the
-- table so the FK matches the schema: ON DELETE set null, ON UPDATE cascade.
-- Migrations run inside a transaction, so PRAGMA foreign_keys cannot be
-- disabled; instead, stash photo_collections rows first so DROP TABLE has
-- no children to cascade-delete, then restore them after the rebuild.
CREATE TEMP TABLE `__pc_backup` AS SELECT * FROM `photo_collections`;--> statement-breakpoint
DELETE FROM `photo_collections`;--> statement-breakpoint
CREATE TABLE `__new_collections` (
	`id` text PRIMARY KEY NOT NULL,
	`area_id` text NOT NULL,
	`name` text NOT NULL,
	`cover_photo_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`cover_photo_id`) REFERENCES `photos`(`id`) ON UPDATE cascade ON DELETE set null
);--> statement-breakpoint
INSERT INTO `__new_collections` SELECT `id`, `area_id`, `name`, `cover_photo_id`, `created_at`, `updated_at` FROM `collections`;--> statement-breakpoint
DROP TABLE `collections`;--> statement-breakpoint
ALTER TABLE `__new_collections` RENAME TO `collections`;--> statement-breakpoint
CREATE INDEX `collections_area_id_idx` ON `collections` (`area_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `collections_area_name_unique` ON `collections` (`area_id`,`name`);--> statement-breakpoint
INSERT INTO `photo_collections` SELECT * FROM `__pc_backup`;--> statement-breakpoint
DROP TABLE `__pc_backup`;
