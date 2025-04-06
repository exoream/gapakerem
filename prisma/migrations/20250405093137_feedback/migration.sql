-- CreateTable
CREATE TABLE `feedbacks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_trip_booking` INTEGER NOT NULL,
    `message` TEXT NOT NULL,
    `rating` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
