/*
  Warnings:

  - Added the required column `payment_proof` to the `trip_bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `trip_bookings` ADD COLUMN `payment_proof` VARCHAR(191) NOT NULL,
    ADD COLUMN `payment_status` VARCHAR(191) NOT NULL DEFAULT 'unpaid';
