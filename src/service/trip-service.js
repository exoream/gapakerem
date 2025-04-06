const Validation = require("../utils/validation/validation");
const prisma = require("../app/config/config");
const { ResponseError } = require("../utils/response/response");
const TripValidation = require("../utils/validation/trip-validation");
const sanitizeMultipartBody = require("../utils/helper/sanitize");
const cloudinary = require("../app/config/cloudinary");

class TripService {
  static async createOpenTrip(request) {
    console.log("Request body:", request.body);

    const body = sanitizeMultipartBody(request.body);
    body.price = Number(body.price);

    const tripData = Validation.validate(TripValidation.createTripSchema, body);

    const openTripData = Validation.validate(
      TripValidation.createOpenTripSchema,
      body.open_trip || {}
    );

    if (
      request.file &&
      !["image/jpeg", "image/jpg", "image/png"].includes(request.file.mimetype)
    ) {
      throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
    }

    if (request.file && request.file.size > 2 * 1024 * 1024) {
      throw new ResponseError("Ukuran foto maksimal 2MB", 400);
    }

    // Upload foto ke Cloudinary
    if (request.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "mountains" }, (error, result) => {
            if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
            else resolve(result.secure_url);
          })
          .end(request.file.buffer);
      });
      tripData.mountain_photo = uploadResult;
    }

    const result = await prisma.$transaction(async (prisma) => {
      const trip = await prisma.trip.create({
        data: tripData,
      });

      const openTrip = await prisma.openTrip.create({
        data: {
          id_trip: trip.id,
          id_guide: openTripData.id_guide,
          traveling_time: openTripData.traveling_time,
          agenda: openTripData.agenda,
        },
      });

      // Check if there are porters and create the openTripPorter records
      if (openTripData.porters && openTripData.porters.length > 0) {
        const openTripPortersData = openTripData.porters.map((porterId) => ({
          id_open_trip: openTrip.id,
          id_porter: porterId,
        }));

        await prisma.openTripPorter.createMany({
          data: openTripPortersData,
        });
      }

      return { trip, open_trip: openTrip };
    });

    return result;
  }

  static async updateOpenTrip(request) {
    const { id_trip } = request.params;

    const body = sanitizeMultipartBody(request.body);
    body.price = Number(body.price);

    const tripData = Validation.validate(TripValidation.updateTripSchema, body);

    const openTripData = Validation.validate(
      TripValidation.updateOpenTripSchema,
      body.open_trip || {}
    );

    console.log("Request body:", request.body);
    console.log("Trip data:", tripData);

    if (request.file) {
      if (
        !["image/jpeg", "image/jpg", "image/png"].includes(
          request.file.mimetype
        )
      ) {
        throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
      }

      if (request.file.size > 2 * 1024 * 1024) {
        throw new ResponseError("Ukuran foto maksimal 2MB", 400);
      }
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Cek apakah trip dengan ID tersebut ada
      const existingTrip = await prisma.trip.findUnique({
        where: { id: Number(id_trip) },
      });

      if (!existingTrip) {
        throw new ResponseError("Trip tidak ditemukan", 404);
      }

      if (
        existingTrip.trip_type === "open" &&
        tripData.trip_type === "private"
      ) {
        throw new ResponseError(
          "Trip dengan tipe 'open' tidak bisa diubah menjadi 'private'",
          400
        );
      }

      // Jika ada foto baru, unggah ke Cloudinary
      if (request.file) {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "mountains" }, (error, result) => {
              if (error)
                reject(new ResponseError("Gagal mengunggah foto", 500));
              else resolve(result.secure_url);
            })
            .end(request.file.buffer);
        });
        tripData.mountain_photo = uploadResult;
      }

      const updatedTrip = await prisma.trip.update({
        where: { id: Number(id_trip) },
        data: {
          ...tripData,
          mountain_photo:
            tripData.mountain_photo || existingTrip.mountain_photo,
        },
      });

      let updatedOpenTrip;
      const existingOpenTrip = await prisma.openTrip.findFirst({
        where: { id_trip: Number(id_trip) },
      });

      if (existingOpenTrip) {
        updatedOpenTrip = await prisma.openTrip.update({
          where: { id: existingOpenTrip.id },
          data: {
            traveling_time: openTripData.traveling_time,
            agenda: openTripData.agenda,
            guide: openTripData.id_guide
              ? { connect: { id: openTripData.id_guide } }
              : undefined,
          },
        });
      } else {
        updatedOpenTrip = await prisma.openTrip.create({
          data: {
            id_trip: Number(id_trip),
            traveling_time: openTripData.traveling_time,
            agenda: openTripData.agenda,
            guide: openTripData.id_guide
              ? { connect: { id: openTripData.id_guide } }
              : undefined,
          },
        });
      }

      // Update porters jika dikirim
      if (openTripData.porters) {
        // Hapus semua porter lama
        await prisma.openTripPorter.deleteMany({
          where: { id_open_trip: updatedOpenTrip.id },
        });

        // Tambahkan porter baru
        const openTripPortersData = openTripData.porters.map((porterId) => ({
          id_open_trip: updatedOpenTrip.id,
          id_porter: porterId,
        }));

        await prisma.openTripPorter.createMany({
          data: openTripPortersData,
        });
      }

      return { trip: updatedTrip, open_trip: updatedOpenTrip };
    });

    return result;
  }

  static async getAllOpenTrips(request) {
    const pageNumber = parseInt(request.query.page) || 1;
    const limitNumber = parseInt(request.query.limit) || 10;
    const skipNumber = (pageNumber - 1) * limitNumber;
    const search = request.query.search || "";

    const filter = {
      trip: {
        trip_type: "open",
        ...(search && {
          mountain_name: {
            contains: search,
          },
        }),
      },
    };

    const totalData = await prisma.openTrip.count({
      where: filter,
    });

    const openTrips = await prisma.openTrip.findMany({
      where: filter,
      skip: skipNumber,
      take: limitNumber,
      include: {
        trip: {
          select: {
            mountain_name: true,
            mountain_photo: true,
            description: true,
            price: true,
            estimation_time: true,
            equipment: true,
            trip_type: true,
          },
        },
        guide: {
          select: {
            name: true,
            photo: true,
          },
        },
        openTripPorters: {
          select: {
            porter: {
              select: {
                name: true,
                photo: true,
              },
            },
          },
        },
      },
    });

    const lastPage = Math.ceil(totalData / limitNumber);

    const formattedTrips = openTrips.map((trip) => ({
      mountain_name: trip.trip.mountain_name,
      mountain_photo: trip.trip.mountain_photo,
      description: trip.trip.description,
      price: trip.trip.price,
      estimation_time: trip.trip.estimation_time,
      equipment: trip.trip.equipment,
      trip_type: trip.trip.trip_type,
      traveling_time: trip.traveling_time,
      agenda: trip.agenda,
      guide: {
        name: trip.guide?.name || null,
        photo: trip.guide?.photo || null,
      },
      porters: trip.openTripPorters.map((p) => ({
        name: p.porter.name,
        photo: p.porter.photo,
      })),
    }));

    const pagination = {
      limit: limitNumber,
      current_page: pageNumber,
      last_page: lastPage,
      total_data: totalData,
    };

    return { trips: formattedTrips, pagination };
  }

  static async getTripById(request) {
    const { id } = request.params;

    const openTrip = await prisma.openTrip.findUnique({
      where: { id: Number(id) },
      include: {
        trip: {
          select: {
            mountain_name: true,
            mountain_photo: true,
            description: true,
            price: true,
            estimation_time: true,
            equipment: true,
            trip_type: true,
          },
        },
        guide: {
          select: {
            name: true,
            photo: true,
          },
        },
        openTripPorters: {
          select: {
            porter: {
              select: {
                name: true,
                photo: true,
              },
            },
          },
        },
      },
    });

    if (!openTrip) {
      throw new ResponseError("Open trip tidak ditemukan", 404);
    }

    const formattedOpenTrip = {
      mountain_name: openTrip.trip.mountain_name,
      mountain_photo: openTrip.trip.mountain_photo,
      description: openTrip.trip.description,
      price: openTrip.trip.price,
      estimation_time: openTrip.trip.estimation_time,
      equipment: openTrip.trip.equipment,
      trip_type: openTrip.trip.trip_type,
      traveling_time: openTrip.traveling_time,
      agenda: openTrip.agenda,
      guide: {
        name: openTrip.guide?.name || null,
        photo: openTrip.guide?.photo || null,
      },
      porters: openTrip.openTripPorters.map((p) => ({
        name: p.porter.name,
        photo: p.porter.photo,
      })),
    };

    return formattedOpenTrip;
  }

  static async createPrivateTrip(request) {
    const body = sanitizeMultipartBody(request.body);
    body.price = Number(body.price);

    const tripData = Validation.validate(TripValidation.createTripSchema, body);

    const privateTripData = Validation.validate(
      TripValidation.createPrivateTripSchema,
      body.private_trip || {}
    );

    if (
      request.file &&
      !["image/jpeg", "image/jpg", "image/png"].includes(request.file.mimetype)
    ) {
      throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
    }

    if (request.file && request.file.size > 2 * 1024 * 1024) {
      throw new ResponseError("Ukuran foto maksimal 2MB", 400);
    }

    // Upload foto ke Cloudinary
    if (request.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "mountains" }, (error, result) => {
            if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
            else resolve(result.secure_url);
          })
          .end(request.file.buffer);
      });
      tripData.mountain_photo = uploadResult;
    }

    const result = await prisma.$transaction(async (prisma) => {
      const trip = await prisma.trip.create({
        data: tripData,
      });

      const privateTrip = await prisma.privateTrip.create({
        data: {
          id_trip: trip.id,
          price_per_day: privateTripData.price_per_day,
        },
      });

      return { trip, private_trip: privateTrip };
    });

    return result;
  }

  static async getAllPrivateTrips(request) {
    const pageNumber = parseInt(request.query.page) || 1;
    const limitNumber = parseInt(request.query.limit) || 10;
    const skipNumber = (pageNumber - 1) * limitNumber;
    const search = request.query.search || "";

    const filter = {
      trip_type: "private",
      ...(search && {
        mountain_name: {
          contains: search,
        },
      }),
    };

    const totalData = await prisma.trip.count({
      where: filter,
    });

    const trips = await prisma.trip.findMany({
      where: filter,
      skip: skipNumber,
      take: limitNumber,
      select: {
        mountain_name: true,
        mountain_photo: true,
        description: true,
        price: true,
        estimation_time: true,
        equipment: true,
        trip_type: true,
        total_participants: true,
      },
    });

    const lastPage = Math.ceil(totalData / limitNumber);

    const pagination = {
      limit: limitNumber,
      current_page: pageNumber,
      last_page: lastPage,
      total_data: totalData,
    };

    return { trips, pagination };
  }

  static async deleteTripById(request) {
    const { id } = request.params;

    const trip = await prisma.trip.findUnique({
      where: { id: Number(id) },
    });

    if (!trip) {
      throw new ResponseError("Trip tidak ditemukan", 404);
    }

    await prisma.trip.delete({
      where: { id: Number(id) },
    });

    return trip;
  }
}

module.exports = TripService;
