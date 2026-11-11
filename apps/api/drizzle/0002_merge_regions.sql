-- Merge 新竹市/新竹縣 and 嘉義市/嘉義縣 into single map regions, and remove the
-- outlying-island areas that have no map region (penghu, kinmen, lienchiang).
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
SELECT 'hsinchu-region', `cover_image`,
  '風城新竹——護城河與城隍廟圍起的百年城區、內灣老街的客家庄韻，與科學城的現代活力在此交會。',
  datetime('now'), datetime('now')
FROM `area_contents` WHERE `area_id` = 'hsinchu-city';
--> statement-breakpoint
INSERT INTO `area_contents` (`area_id`, `cover_image`, `description`, `created_at`, `updated_at`)
SELECT 'chiayi-region', `cover_image`,
  '嘉義——檜木老屋與火雞肉飯構成的藝文慢城，往山裡走是阿里山的日出雲海與千年神木。',
  datetime('now'), datetime('now')
FROM `area_contents` WHERE `area_id` = 'chiayi-city';
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
