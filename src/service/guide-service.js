const GuideValidation = require("../utils/validation/guide-validation");
const Validation = require("../utils/validation/validation");
const cloudinary = require("../app/config/cloudinary");
const prisma = require("../app/config/config");
const { ResponseError } = require("../utils/response/response");

class GuideService {
  static async createGuide(request) {
    if (!request.body.name) throw new ResponseError("Nama wajib diisi", 400);
    const name = request.body.name.toString().trim();

    Validation.validate(GuideValidation.createGuideSchema, { name });

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
    let photoUrl = null;
    if (request.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "guides" }, (error, result) => {
            if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
            else resolve(result.secure_url);
          })
          .end(request.file.buffer);
      });

      photoUrl = uploadResult;
    }

    const result = await prisma.guide.create({
      data: { name, photo: photoUrl },
      select: { id: true, name: true, photo: true },
    });

    return result;
  }

  static async updateGuide(request) {
    const { id } = request.params;
    const { name } = request.body;

    Validation.validate(GuideValidation.updateGuideSchema, { name });

    const existingGuide = await prisma.guide.findUnique({
      where: { id: Number(id) },
      select: { photo: true },
    });

    if (!existingGuide) throw new ResponseError("Guide tidak ditemukan", 404);

    if (
      request.file &&
      !["image/jpeg", "image/jpg", "image/png"].includes(request.file.mimetype)
    ) {
      throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
    }

    if (request.file && request.file.size > 2 * 1024 * 1024) {
      throw new ResponseError("Ukuran foto maksimal 2MB", 400);
    }

    let photoUrl = existingGuide.photo;
    if (request.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "guides" }, (error, result) => {
            if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
            else resolve(result.secure_url);
          })
          .end(request.file.buffer);
      });

      photoUrl = uploadResult;
    }

    const updatedGuide = await prisma.guide.update({
      where: { id: Number(id) },
      data: { name, photo: photoUrl },
      select: { id: true, name: true, photo: true },
    });

    return updatedGuide;
  }

  static async getAllGuides(request) {
    const { page, limit, search } = request.query;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    const filter = search
      ? {
          name: {
            contains: search,
          },
        }
      : {};

    const totalData = await prisma.guide.count({
      where: filter,
    });

    const result = await prisma.guide.findMany({
      where: filter,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      select: {
        id: true,
        name: true,
        photo: true,
      },
    });

    const lastPage = Math.ceil(totalData / limitNumber);

    return {
      guides: result,
      pagination: {
        limit: limitNumber,
        current_page: pageNumber,
        last_page: lastPage,
        total_data: totalData,
      },
    };
  }

  static async getGuideById(id) {
    const guide = await prisma.guide.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true, photo: true },
    });

    if (!guide) throw new ResponseError("Guide tidak ditemukan", 404);

    return guide;
  }

  static async deleteGuide(id) {
    const guide = await prisma.guide.findUnique({
      where: { id: Number(id) },
    });

    if (!guide) throw new ResponseError("Guide tidak ditemukan", 404);

    await prisma.guide.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = GuideService;
