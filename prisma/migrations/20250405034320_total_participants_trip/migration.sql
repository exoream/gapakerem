/*
  Warnings:

  - Added the required column `updatedAt` to the `trips` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `trips` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `total_participants` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
