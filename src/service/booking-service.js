const Validation = require("../utils/validation/validation");
const prisma = require("../app/config/config");
const { ResponseError } = require("../utils/response/response");
const BookingValidation = require("../utils/validation/booking-validation");
const cloudinary = require("../app/config/cloudinary");

class BookingService {
  static async createBookingPrivateTrip(request) {
    console.log(request.body);

    const bookingData = Validation.validate(
      BookingValidation.createBookingSchema,
      request.body
    );

    const privateBookingData = Validation.validate(
      BookingValidation.createSchemaPrivateTrip,
      request.body.private_trip || {}
    );

    const userId = request.user.id;

    // Simpan data booking & private trip
    const result = await prisma.$transaction(async (prisma) => {
      const trip = await prisma.trip.findUnique({
        where: { id: bookingData.id_trip },
      });

      if (!trip) throw new ResponseError("Trip tidak ditemukan", 404);

      const privateTrip = await prisma.privateTrip.findFirst({
        where: {
          id_trip: bookingData.id_trip,
        },
      });

      if (!privateTrip)
        throw new ResponseError("Private trip tidak ditemukan", 404);

      const guide = await prisma.guide.findUnique({
        where: { id: privateBookingData.id_guide },
      });

      if (!guide) throw new ResponseError("Guide tidak ditemukan", 404);

      let additionalPorterFee = 0;
      if (privateBookingData.porters?.length) {
        const porters = await prisma.porter.findMany({
          where: { id: { in: privateBookingData.porters } },
        });

        if (porters.length !== privateBookingData.porters.length) {
          throw new ResponseError("Beberapa porter tidak ditemukan", 404);
        }

        // Validasi tambahan biaya jika porter lebih dari 3
        const porterCount = privateBookingData.porters.length;
        if (porterCount > 3) {
          additionalPorterFee = (porterCount - 3) * 350000;
        }
      }
      
      const total_price =
        trip.price * bookingData.total_participants +
        privateTrip.price_per_day * privateBookingData.total_days +
        additionalPorterFee;

      const booking = await prisma.tripBooking.create({
        data: {
          ...bookingData,
          id_user: userId,
          total_price,
          trip_type: trip.trip_type,
        },
      });

      const privateTripBooking = await prisma.privateTripBooking.create({
        data: {
          id_guide: privateBookingData.id_guide,
          total_days: privateBookingData.total_days,
          start_date: new Date(privateBookingData.start_date),
          id_trip_booking: booking.id,
        },
      });

      if (privateBookingData.porters?.length) {
        const porterData = privateBookingData.porters.map((id) => ({
          id_private_trip_booking: privateTripBooking.id,
          id_porter: id,
        }));

        await prisma.porterPrivateTripBooking.createMany({ data: porterData });
      }

      return {
        booking: {
          ...booking,
          private_trip_booking: {
            ...privateTripBooking,
            porters: privateBookingData.porters,
          },
        },
      };
    });

    return result;
  }

  static async createBookingOpenTrip(request) {
    const bookingData = Validation.validate(
      BookingValidation.createBookingSchema,
      request.body
    );

    const userId = request.user.id;

    // Simpan data booking & private trip
    const result = await prisma.$transaction(async (prisma) => {
      const trip = await prisma.trip.findUnique({
        where: { id: bookingData.id_trip },
      });

      if (!trip) throw new ResponseError("Trip tidak ditemukan", 404);

      if (trip.trip_type !== "open")
        throw new ResponseError("Trip bukan termasuk open trip", 404);

      const openTrip = await prisma.openTrip.findFirst({
        where: { id_trip: bookingData.id_trip },
      });

      if (!openTrip) {
        throw new ResponseError("Open trip tidak ditemukan", 404);
      }

      const total_price = trip.price * bookingData.total_participants;

      const booking = await prisma.tripBooking.create({
        data: {
          ...bookingData,
          id_user: userId,
          total_price,
          trip_type: trip.trip_type,
        },
      });

      return {
        booking,
      };
    });

    return result;
  }

  // static async getAllBookingOpenTrip(request) {
  //   const { page, limit, search } = request.query;
  //   const pageNumber = parseInt(page) || 1;
  //   const limitNumber = parseInt(limit) || 10;

  //   const filter = search
  //     ? {
  //         trip_type: "open",
  //         AND: [
  //           {
  //             OR: [
  //               {
  //                 name_participants: {
  //                   contains: search,
  //                 },
  //               },
  //               {
  //                 meeting_point: {
  //                   contains: search,
  //                 },
  //               },
  //             ],
  //           },
  //         ],
  //       }
  //     : {
  //         trip_type: "open",
  //       };

  //   const totalData = await prisma.tripBooking.count({
  //     where: filter,
  //   });

  //   const bookings = await prisma.tripBooking.findMany({
  //     where: filter,
  //     skip: (pageNumber - 1) * limitNumber,
  //     take: limitNumber,
  //     include: {
  //       trip: {
  //         select: { mountain_name: true },
  //       },
  //     },
  //   });

  //   const formattedBookings = bookings.map((booking) => ({
  //     participant_name: booking.name_participants,
  //     phone_number: booking.no_hp,
  //     meeting_point: booking.meeting_point,
  //     mountain_name: booking.trip.mountain_name,
  //     total_price: booking.total_price,
  //     payment_proof: booking.payment_proof,
  //     payment_status: booking.payment_status,
  //   }));

  //   const lastPage = Math.ceil(totalData / limitNumber);

  //   return {
  //     bookings: formattedBookings,
  //     pagination: {
  //       limit: limitNumber,
  //       current_page: pageNumber,
  //       last_page: lastPage,
  //       total_data: totalData,
  //     },
  //   };
  // }

  static async getAllBookingTrip(request) {
    const { page, limit, search, trip_type } = request.query;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    const tripTypes = ["open", "private"];
    if (!tripTypes.includes(trip_type)) {
      throw new ResponseError("Tipe trip tidak valid", 400);
    }

    const filter = search
      ? {
          trip_type,
          AND: [
            {
              OR: [
                {
                  name_participants: {
                    contains: search,
                  },
                },
                {
                  meeting_point: {
                    contains: search,
                  },
                },
              ],
            },
          ],
        }
      : {
          trip_type,
        };

    const totalData = await prisma.tripBooking.count({
      where: filter,
    });

    const bookings = await prisma.tripBooking.findMany({
      where: filter,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      include: {
        trip: {
          select: { mountain_name: true },
        },
      },
    });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      participant_name: booking.name_participants,
      phone_number: booking.no_hp,
      mountain_name: booking.trip.mountain_name,
      total_price: booking.total_price,
      payment_proof: booking.payment_proof,
      payment_status: booking.payment_status,
    }));

    const lastPage = Math.ceil(totalData / limitNumber);

    return {
      bookings: formattedBookings,
      pagination: {
        limit: limitNumber,
        current_page: pageNumber,
        last_page: lastPage,
        total_data: totalData,
      },
    };
  }

  static async getBookingById(request) {
    const { id } = request.params;

    const booking = await prisma.tripBooking.findUnique({
      where: { id: Number(id) },
      include: {
        trip: {
          select: {
            mountain_name: true,
            openTrips: {
              include: {
                guide: {
                  select: { name: true, photo: true },
                },
                openTripPorters: {
                  include: {
                    porter: {
                      select: { name: true, photo: true },
                    },
                  },
                },
              },
            },
          },
        },
        privateTripBooking: {
          include: {
            guide: {
              select: { name: true, photo: true },
            },
            porterPrivateTripBooking: {
              include: {
                porter: {
                  select: { name: true, photo: true },
                },
              },
            },
          },
        },
      },
    });

    if (!booking) throw new ResponseError("Booking tidak ditemukan", 404);

    let guide = null;
    let porters = [];
    let total_days = null;
    let start_date = null;

    if (booking.trip_type === "private") {
      const privateData = booking.privateTripBooking[0];
      guide = privateData?.guide || null;
      porters =
        privateData?.porterPrivateTripBooking.map((p) => p.porter) || [];
      total_days = privateData?.total_days || null;
      start_date = privateData?.start_date || null;
    } else if (booking.trip_type === "open") {
      const openData = booking.trip.openTrips[0];
      guide = openData?.guide || null;
      porters = openData?.openTripPorters.map((p) => p.porter) || [];
    }

    return {
      participant_name: booking.name_participants,
      phone_number: booking.no_hp,
      mountain_name: booking.trip.mountain_name,
      total_price: booking.total_price,
      payment_proof: booking.payment_proof,
      status: booking.payment_status,
      guide,
      porters,
      ...(booking.trip_type === "private" && {
        total_days,
        start_date,
      }),
    };
  }

  static async uploadPaymentProof(request) {
    const { id } = request.params;

    const existingBooking = await prisma.tripBooking.findUnique({
      where: { id: Number(id) },
    });

    if (!existingBooking) {
      throw new ResponseError("Data booking tidak ditemukan", 404);
    }

    if (existingBooking.id_user !== request.user.id) {
      throw new ResponseError(
        "Kamu tidak memiliki akses untuk booking ini",
        403
      );
    }
    
    if (
      existingBooking.payment_proof &&
      existingBooking.payment_status !== "rejected"
    ) {
      throw new ResponseError(
        "Bukti pembayaran sudah diunggah sebelumnya",
        400
      );
    }

    if (!request.file) {
      throw new ResponseError("Bukti pembayaran tidak ditemukan", 400);
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(request.file.mimetype)) {
      throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
    }

    const maxSize = 2 * 1024 * 1024;
    if (request.file.size > maxSize) {
      throw new ResponseError("Ukuran foto maksimal 2MB", 400);
    }

    // Upload ke Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "payment_proofs" }, (error, result) => {
          if (error) {
            reject(new ResponseError("Gagal mengunggah foto", 500));
          } else {
            resolve(result.secure_url);
          }
        })
        .end(request.file.buffer);
    });

    const updatedBooking = await prisma.tripBooking.update({
      where: { id: Number(id) },
      data: {
        payment_proof: uploadResult,
        payment_status: "paid",
      },
      select: {
        id: true,
        payment_proof: true,
        payment_status: true,
      },
    });

    return updatedBooking;
  }

  static async updateStatusPayment(request) {
    const { id } = request.params;
    const { status } = request.body;

    const booking = await prisma.tripBooking.findUnique({
      where: { id: Number(id) },
    });

    if (!booking) {
      throw new ResponseError("Data booking tidak ditemukan", 404);
    }

    const allowedStatuses = ["approved", "rejected"];
    if (!allowedStatuses.includes(status)) {
      throw new ResponseError("Status pembayaran tidak valid", 400);
    }

    if (booking.payment_status === "approved") {
      throw new ResponseError("Status pembayaran sudah selesai", 400);
    }

    if (["unpaid", "paid"].includes(status)) {
      throw new ResponseError(
        "Status pembayaran tidak boleh diubah ke unpaid atau paid",
        400
      );
    }

    if (!booking.payment_proof && booking.payment_status !== "paid") {
      throw new ResponseError(
        "Bukti pembayaran tidak ditemukan, status pembayaran tidak dapat diubah",
        400
      );
    }

    const updatedBooking = await prisma.tripBooking.update({
      where: { id: Number(id) },
      data: {
        payment_status: status,
      },
      select: {
        id: true,
        id_trip: true,
        total_participants: true,
        payment_proof: true,
        payment_status: true,
      },
    });

    if (status === "approved") {
      await prisma.trip.update({
        where: { id: updatedBooking.id_trip },
        data: {
          total_participants: {
            increment: updatedBooking.total_participants,
          },
        },
      });
    }

    console.log(updatedBooking);

    return updatedBooking;
  }

  static async getBookingByUserId(request) {
    const userId = request.user.id;

    const bookings = await prisma.tripBooking.findMany({
      where: { id_user: userId },
      include: {
        trip: {
          select: {
            mountain_name: true,
            openTrips: {
              include: {
                guide: {
                  select: { name: true, photo: true },
                },
              },
            },
          },
        },
      },
    });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      participant_name: booking.name_participants,
      phone_number: booking.no_hp,
      mountain_name: booking.trip.mountain_name,
      total_price: booking.total_price,
      payment_proof: booking.payment_proof,
      payment_status: booking.payment_status,
      trip_type: booking.trip_type,
      created_at: booking.created_at,
    }));

    return formattedBookings;
  }

  static async getBookingDetailByUserId(request) {
    const { id } = request.params;
    const userId = request.user.id;

    const booking = await prisma.tripBooking.findUnique({
      where: { id: Number(id) },
      include: {
        trip: {
          select: {
            mountain_name: true,
            openTrips: {
              include: {
                guide: {
                  select: { name: true, photo: true },
                },
              },
            },
          },
        },
      },
    });

    if (!booking) throw new ResponseError("Booking tidak ditemukan", 404);

    if (booking.id_user !== userId) {
      throw new ResponseError(
        "Kamu tidak memiliki akses untuk booking ini",
        403
      );
    }

    const formattedBookings = {
      participant_name: booking.name_participants,
      phone_number: booking.no_hp,
      mountain_name: booking.trip.mountain_name,
      total_price: booking.total_price,
      payment_proof: booking.payment_proof,
      payment_status: booking.payment_status,
      trip_type: booking.trip_type,
      created_at: booking.created_at,
    };

    return formattedBookings;
  }
}

module.exports = BookingService;
