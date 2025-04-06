const BookingService = require("../service/booking-service");
const { successResponse } = require("../utils/response/response");

class BookingController {
  async createBookingPrivateTrip(req, res, next) {
    try {
      const booking = await BookingService.createBookingPrivateTrip(req);
      return res
        .status(201)
        .json(
          successResponse("Berhasil membuat booking private trip", booking)
        );
    } catch (error) {
      next(error);
    }
  }

  async createBookingOpenTrip(req, res, next) {
    try {
      const booking = await BookingService.createBookingOpenTrip(req);
      return res
        .status(201)
        .json(successResponse("Berhasil membuat booking open trip", booking));
    } catch (error) {
      next(error);
    }
  }

  async getAllBookingTrip(req, res, next) {
    try {
      const bookings = await BookingService.getAllBookingTrip(req);
      return res
        .status(200)
        .json(
          successResponse(
            "Berhasil mendapatkan semua booking trip",
            bookings
          )
        );
    } catch (error) {
      next(error);
    }
  }

  // async getAllBookingOpenTrip(req, res, next) {
  //   try {
  //     const bookings = await BookingService.getAllBookingOpenTrip(req);
  //     return res
  //       .status(200)
  //       .json(
  //         successResponse(
  //           "Berhasil mendapatkan semua booking open trip",
  //           bookings
  //         )
  //       );
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  async getBookingById(req, res, next) {
    try {
      const booking = await BookingService.getBookingById(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan booking", booking));
    } catch (error) {
      next(error);
    }
  }

  async uploadPaymentProof(req, res, next) {
    try {
      const booking = await BookingService.uploadPaymentProof(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mengupload bukti pembayaran", booking));
    } catch (error) {
      next(error);
    }
  }

  async updateStatusPayment(req, res, next) {
    try {
      const booking = await BookingService.updateStatusPayment(req);
      return res
        .status(200)
        .json(successResponse("Berhasil memperbarui status booking", booking));
    } catch (error) {
      next(error);
    }
  }

  async getBookingByUserId(req, res, next) {
    try {
      const bookings = await BookingService.getBookingByUserId(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan booking", bookings));
    } catch (error) {
      next(error);
    }
  }

  async getBookingDetailByUserId(req, res, next) {
    try {
      const booking = await BookingService.getBookingDetailByUserId(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan detail booking", booking));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookingController;
