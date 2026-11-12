-- Merge 新竹市/新竹縣 and 嘉義市/嘉義縣 into single map regions, and remove the
-- outlying-island areas that have no map region (penghu, kinmen, lienchiang).
-- Each merged region keeps the city's cover and joins both descriptions.
INSERT INTO `areas` (`id`, `name`) VALUES
  ('hsinchu-region', '新竹'),
  ('chiayi-region', '嘉義');
--> statement-breakpoint
UPDATE `photos` SET `area_id` = 'hsinchu-region'
  WHERE `area_id` IN ('hsinchu-city', 'hsinchu-county');
--> statement-breakpoint
UPDATE `photos` SET `area_id` = 'chiayi-region'
  WHERE `area_id` IN ('chiayi-city', 'chiayi-county');
--> statement-breakpoint
UPDATE `collections` SET `area_id` = 'hsinchu-region'
  WHERE `area_id` IN ('hsinchu-city', 'hsinchu-county');
--> statement-breakpoint
UPDATE `collections` SET `area_id` = 'chiayi-region'
  WHERE `area_id` IN ('chiayi-city', 'chiayi-county');
--> statement-breakpoint
INSERT INTO `area_contents` (`area_id`, `cover_image`, `description`, `created_at`, `updated_at`)
SELECT 'hsinchu-region',
  city.`cover_image`,
  NULLIF(TRIM(COALESCE(city.`description`, '') || COALESCE(county.`description`, '')), ''),
  datetime('now'), datetime('now')
FROM `area_contents` AS city
LEFT JOIN `area_contents` AS county ON county.`area_id` = 'hsinchu-county'
WHERE city.`area_id` = 'hsinchu-city';
--> statement-breakpoint
INSERT INTO `area_contents` (`area_id`, `cover_image`, `description`, `created_at`, `updated_at`)
SELECT 'chiayi-region',
  city.`cover_image`,
  NULLIF(TRIM(COALESCE(city.`description`, '') || COALESCE(county.`description`, '')), ''),
  datetime('now'), datetime('now')
FROM `area_contents` AS city
LEFT JOIN `area_contents` AS county ON county.`area_id` = 'chiayi-county'
WHERE city.`area_id` = 'chiayi-city';
--> statement-breakpoint
DELETE FROM `photos`
  WHERE `area_id` IN ('penghu-county', 'kinmen-county', 'lienchiang-county');
--> statement-breakpoint
DELETE FROM `collections`
  WHERE `area_id` IN ('penghu-county', 'kinmen-county', 'lienchiang-county');
--> statement-breakpoint
DELETE FROM `areas`
  WHERE `id` IN (
    'hsinchu-city', 'hsinchu-county', 'chiayi-city', 'chiayi-county',
    'penghu-county', 'kinmen-county', 'lienchiang-county'
  );
