/*
  Warnings:

  - A unique constraint covering the columns `[order_sequence]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_sequence` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `order_sequence` INTEGER NOT NULL,
    MODIFY `order_number` VARCHAR(50) NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX `orders_order_sequence_key` ON `orders`(`order_sequence`);
