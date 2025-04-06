-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_id_trip_booking_fkey` FOREIGN KEY (`id_trip_booking`) REFERENCES `trip_bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
