-- CreateTable
CREATE TABLE `trips` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mountain_name` VARCHAR(191) NOT NULL,
    `mountain_photo` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `equipment` TEXT NOT NULL,
    `estimation_time` TEXT NOT NULL,
    `price` BIGINT NOT NULL,
    `trip_type` ENUM('open', 'private') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `open_trips` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_trip` INTEGER NOT NULL,
    `id_guide` INTEGER NOT NULL,
    `traveling_time` VARCHAR(191) NOT NULL,
    `agenda` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `open_trip_porters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_open_trip` INTEGER NOT NULL,
    `id_porter` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trip_bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `id_trip` INTEGER NOT NULL,
    `total_participants` INTEGER NOT NULL,
    `name_participants` TEXT NOT NULL,
    `no_hp` VARCHAR(191) NOT NULL,
    `meeting_point` TEXT NOT NULL,
    `total_price` BIGINT NOT NULL,
    `trip_type` ENUM('open', 'private') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `private_trip_bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_trip_booking` INTEGER NOT NULL,
    `total_days` INTEGER NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `id_guide` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `porter_trip_bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_private_trip_booking` INTEGER NOT NULL,
    `id_porter` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `open_trips` ADD CONSTRAINT `open_trips_id_trip_fkey` FOREIGN KEY (`id_trip`) REFERENCES `trips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `open_trips` ADD CONSTRAINT `open_trips_id_guide_fkey` FOREIGN KEY (`id_guide`) REFERENCES `guides`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `open_trip_porters` ADD CONSTRAINT `open_trip_porters_id_open_trip_fkey` FOREIGN KEY (`id_open_trip`) REFERENCES `open_trips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `open_trip_porters` ADD CONSTRAINT `open_trip_porters_id_porter_fkey` FOREIGN KEY (`id_porter`) REFERENCES `porters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_bookings` ADD CONSTRAINT `trip_bookings_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trip_bookings` ADD CONSTRAINT `trip_bookings_id_trip_fkey` FOREIGN KEY (`id_trip`) REFERENCES `trips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `private_trip_bookings` ADD CONSTRAINT `private_trip_bookings_id_trip_booking_fkey` FOREIGN KEY (`id_trip_booking`) REFERENCES `trip_bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `private_trip_bookings` ADD CONSTRAINT `private_trip_bookings_id_guide_fkey` FOREIGN KEY (`id_guide`) REFERENCES `guides`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `porter_trip_bookings` ADD CONSTRAINT `porter_trip_bookings_id_private_trip_booking_fkey` FOREIGN KEY (`id_private_trip_booking`) REFERENCES `private_trip_bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `porter_trip_bookings` ADD CONSTRAINT `porter_trip_bookings_id_porter_fkey` FOREIGN KEY (`id_porter`) REFERENCES `porters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
