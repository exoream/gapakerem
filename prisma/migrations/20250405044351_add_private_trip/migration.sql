-- CreateTable
CREATE TABLE `private_trips` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_trip` INTEGER NOT NULL,
    `price_per_day` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `private_trips` ADD CONSTRAINT `private_trips_id_trip_fkey` FOREIGN KEY (`id_trip`) REFERENCES `trips`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
