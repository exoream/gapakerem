const express = require("express");
const { jwtMiddleware } = require("../../utils/middleware/jwt");
const { isAdmin } = require("../../utils/middleware/admin-middleware");
const BookingController = require("../../controller/booking-controller");
const upload = require("../../utils/helper/multer");

const bookingController = new BookingController();

const router = express.Router();

router.get(
  "/bookings",
  jwtMiddleware,
  isAdmin,
  bookingController.getAllBookingTrip.bind(bookingController)
);

router.post(
  "/bookings/private",
  jwtMiddleware,
  bookingController.createBookingPrivateTrip.bind(bookingController)
);

router.post(
  "/bookings/open",
  jwtMiddleware,
  bookingController.createBookingOpenTrip.bind(bookingController)
);

// router.get(
//   "/bookings/open",
//   jwtMiddleware,
//   isAdmin,
//   bookingController.getAllBookingOpenTrip.bind(bookingController)
// );

router.get(
  "/bookings/profile",
  jwtMiddleware,
  bookingController.getBookingByUserId.bind(bookingController)
);

router.get(
  "/bookings/profile/:id",
  jwtMiddleware,
  bookingController.getBookingDetailByUserId.bind(bookingController)
);

router.get(
  "/bookings/:id",
  jwtMiddleware,
  bookingController.getBookingById.bind(bookingController)
);

router.patch(
  "/bookings/:id/upload-proof",
  jwtMiddleware,
  upload.single("payment_proof"),
  bookingController.uploadPaymentProof.bind(bookingController)
);

router.patch(
  "/bookings/:id/status",
  jwtMiddleware,
  isAdmin,
  bookingController.updateStatusPayment.bind(bookingController)
);

module.exports = router;