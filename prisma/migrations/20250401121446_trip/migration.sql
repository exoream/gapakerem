/*
  Warnings:

  - You are about to alter the column `total_price` on the `trip_bookings` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `price` on the `trips` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `trip_bookings` MODIFY `total_price` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `trips` MODIFY `price` INTEGER NOT NULL;
