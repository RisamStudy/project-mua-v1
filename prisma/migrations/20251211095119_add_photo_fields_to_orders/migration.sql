/*
  Warnings:

  - You are about to drop the column `stage_model` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `tent_color` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orders` DROP COLUMN `stage_model`,
    DROP COLUMN `tent_color`,
    ADD COLUMN `dress_photos` JSON NULL,
    ADD COLUMN `stage_model_photo` LONGTEXT NULL,
    ADD COLUMN `tent_color_photo` LONGTEXT NULL;
