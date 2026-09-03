CREATE TABLE `area_contents` (
	`area_id` text PRIMARY KEY NOT NULL,
	`cover_image` text,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `areas` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`area_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `collections_area_id_idx` ON `collections` (`area_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `collections_area_name_unique` ON `collections` (`area_id`,`name`);--> statement-breakpoint
CREATE TABLE `photo_collections` (
	`photo_id` text NOT NULL,
	`collection_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`photo_id`, `collection_id`),
	FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `photo_collections_collection_id_idx` ON `photo_collections` (`collection_id`);--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`area_id` text NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`description` text,
	`image` text NOT NULL,
	`taken_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `photos_area_id_idx` ON `photos` (`area_id`);--> statement-breakpoint
CREATE INDEX `photos_area_taken_at_idx` ON `photos` (`area_id`,`taken_at`);