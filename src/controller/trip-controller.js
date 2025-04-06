const TripService = require("../service/trip-service");
const { successResponse } = require("../utils/response/response");

class TripController {
  async createTrip(req, res, next) {
    try {
      const trip = await TripService.createOpenTrip(req);
      return res
        .status(201)
        .json(successResponse("Berhasil membuat open trip", trip));
    } catch (error) {
      next(error);
    }
  }

  async updateTrip(req, res, next) {
    try {
      const trip = await TripService.updateOpenTrip(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mengupdate open trip", trip));
    } catch (error) {
      next(error);
    }
  }

  async getAllOpenTrip(req, res, next) {
    try {
      const trips = await TripService.getAllOpenTrips(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan semua open trip", trips));
    } catch (error) {
      next(error);
    }
  }

  async getTripById(req, res, next) {
    try {
      const trip = await TripService.getTripById(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan trip", trip));
    } catch (error) {
      next(error);
    }
  }

  async createPrivateTrip(req, res, next) {
    try {
      const trip = await TripService.createPrivateTrip(req);
      return res
        .status(201)
        .json(successResponse("Berhasil membuat private trip", trip));
    } catch (error) {
      next(error);
    }
  }

  async getAllPrivateTrips(req, res, next) {
    try {
      const trips = await TripService.getAllPrivateTrips(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan semua private trip", trips));
    } catch (error) {
      next(error);
    }
  }

  async deleteTripById (req, res, next) {
    try {
      await TripService.deleteTripById(req);
      return res
        .status(200)
        .json(successResponse("Berhasil menghapus trip"));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TripController;