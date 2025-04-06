const express = require("express");
const { jwtMiddleware } = require("../../utils/middleware/jwt");
const FeedbackController = require("../../controller/feedback-controller");

const feedbackController = new FeedbackController();

const router = express.Router();

router.post(
  "/feedbacks",
  jwtMiddleware,
  feedbackController.createFeedback.bind(feedbackController)
);

router.get(
  "/feedbacks",
  feedbackController.getAllFeedback.bind(feedbackController)
);

router.get(
  "/feedbacks/average/:id_trip",
  feedbackController.getAverageRating.bind(feedbackController)
);

module.exports = router;