-- Rename the merged city/county regions to explicit 縣市 names.
UPDATE `areas` SET `name` = '新竹縣市' WHERE `id` = 'hsinchu-region';
--> statement-breakpoint
UPDATE `areas` SET `name` = '嘉義縣市' WHERE `id` = 'chiayi-region';
