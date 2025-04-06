const Validation = require("../utils/validation/validation");
const prisma = require("../app/config/config");
const { ResponseError } = require("../utils/response/response");
const FeedbackValidation = require("../utils/validation/feedback-validation");

class FeedbackService {
  static async createFeedback(request) {
    console.log(request.body);

    const feedback = Validation.validate(
      FeedbackValidation.createFeedbackSchema,
      request.body
    );

    const userId = request.user.id;

    const booking = await prisma.tripBooking.findUnique({
      where: {
        id: feedback.id_trip_booking,
      },
      include: { trip: true },
    });

    if (!booking) {
      throw new ResponseError("Booking tidak ditemukan", 404);
    }

    if (booking.id_user !== userId) {
      throw new ResponseError(
        "Anda tidak memiliki akses feedback di booking ini",
        403
      );
    }

    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        id_trip_booking: feedback.id_trip_booking,
      },
    });

    if (existingFeedback) {
      throw new ResponseError("Feedback sudah pernah diberikan", 400);
    }

    const newFeedback = await prisma.feedback.create({
      data: {
        id_trip_booking: feedback.id_trip_booking,
        message: feedback.message,
        rating: feedback.rating,
      },
      select: {
        id: true,
        message: true,
        rating: true,
        created_at: true,
      },
    });

    return newFeedback;
  }

  static async getAllFeedback(request) {
    const { page, limit } = request.query;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    const totalData = await prisma.feedback.count();

    const result = await prisma.feedback.findMany({
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      include: {
        tripBooking: {
          include: {
            trip: true,
            user: true,
          },
        },
      },
    });

    const lastPage = Math.ceil(totalData / limitNumber);

    const feedbacks = result.map((feedback) => {
      return {
        id: feedback.id,
        message: feedback.message,
        rating: feedback.rating,
        created_at: feedback.created_at,
        trip_booking: {
          trip: {
            mountain_name: feedback.tripBooking.trip.mountain_name,
            mountain_photo: feedback.tripBooking.trip.mountain_photo,
          },
          user: {
            name: feedback.tripBooking.user.name,
          },
        },
      };
    });

    return {
      feedbacks: feedbacks,
      pagination: {
        limit: limitNumber,
        current_page: pageNumber,
        last_page: lastPage,
        total_data: totalData,
      },
    };
  }

  static async getAverageRating(request) {
    const { id_trip } = request.params;

    const trip = await prisma.trip.findUnique({
      where: {
        id: Number(id_trip),
      },
    });

    if (!trip) {
      throw new ResponseError("Trip tidak ditemukan", 404);
    }

    const averageRating = await prisma.feedback.aggregate({
      where: {
        tripBooking: {
          trip: {
            id: Number(id_trip),
          },
        },
      },
      _avg: {
        rating: true,
      },
    });

    return {
      average_rating: averageRating._avg.rating,
    }
  }
}

module.exports = FeedbackService;
