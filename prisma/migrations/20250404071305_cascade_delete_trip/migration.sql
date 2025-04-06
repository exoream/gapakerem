-- DropForeignKey
ALTER TABLE `open_trip_porters` DROP FOREIGN KEY `open_trip_porters_id_open_trip_fkey`;

-- DropForeignKey
ALTER TABLE `open_trips` DROP FOREIGN KEY `open_trips_id_trip_fkey`;

-- DropIndex
DROP INDEX `open_trip_porters_id_open_trip_fkey` ON `open_trip_porters`;

-- DropIndex
DROP INDEX `open_trips_id_trip_fkey` ON `open_trips`;

-- AddForeignKey
ALTER TABLE `open_trips` ADD CONSTRAINT `open_trips_id_trip_fkey` FOREIGN KEY (`id_trip`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `open_trip_porters` ADD CONSTRAINT `open_trip_porters_id_open_trip_fkey` FOREIGN KEY (`id_open_trip`) REFERENCES `open_trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
