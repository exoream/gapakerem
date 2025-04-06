const FeedbackService = require("../service/feedback-service");
const { successResponse } = require("../utils/response/response");

class FeedbackController {
  async createFeedback(req, res, next) {
    try {
      const feedback = await FeedbackService.createFeedback(req);
      return res
        .status(201)
        .json(successResponse("Berhasil memberikan feedback", feedback));
    } catch (error) {
      next(error);
    }
  }

  async getAllFeedback(req, res, next) {
    try {
      const feedbacks = await FeedbackService.getAllFeedback(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan semua feedback", feedbacks));
    } catch (error) {
      next(error);
    }
  }

  async getAverageRating(req, res, next) {
    try {
      const averageRating = await FeedbackService.getAverageRating(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan rating rata-rata", averageRating));
    } catch (error) {
      next(error);
    }
  }
}


module.exports = FeedbackController;