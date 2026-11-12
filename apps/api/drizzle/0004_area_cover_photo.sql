ALTER TABLE `area_contents` ADD `cover_photo_id` text REFERENCES photos(id) ON UPDATE cascade ON DELETE set null;--> statement-breakpoint
ALTER TABLE `area_contents` DROP COLUMN `cover_image`;