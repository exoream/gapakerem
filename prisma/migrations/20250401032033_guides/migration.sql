/*
  Warnings:

  - You are about to drop the column `foto` on the `guides` table. All the data in the column will be lost.
  - Added the required column `photo` to the `guides` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `guides` DROP COLUMN `foto`,
    ADD COLUMN `photo` VARCHAR(191) NOT NULL;
    
