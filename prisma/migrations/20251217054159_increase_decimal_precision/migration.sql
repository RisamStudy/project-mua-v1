/*
  Warnings:

  - You are about to alter the column `total_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(15,2)`.
  - You are about to alter the column `paid_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(15,2)`.
  - You are about to alter the column `remaining_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(15,2)`.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(15,2)`.

*/
-- AlterTable
ALTER TABLE `orders` MODIFY `total_amount` DECIMAL(15, 2) NOT NULL,
    MODIFY `paid_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    MODIFY `remaining_amount` DECIMAL(15, 2) NOT NULL;

-- AlterTable
ALTER TABLE `payments` MODIFY `amount` DECIMAL(15, 2) NOT NULL;
