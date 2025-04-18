const Validation = require("../utils/validation/validation");
const cloudinary = require("../app/config/cloudinary");
const prisma = require("../app/config/config");
const { ResponseError } = require("../utils/response/response");
const PorterValidation = require("../utils/validation/porter-validation");

class PorterService {
  static async createPorter(request) {
    if (!request.body.name) throw new ResponseError("Nama wajib diisi", 400);
    const name = request.body.name.toString().trim();

    Validation.validate(PorterValidation.createPorterSchema, { name });

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
          .upload_stream({ folder: "porters" }, (error, result) => {
            if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
            else resolve(result.secure_url);
          })
          .end(request.file.buffer);
      });

      photoUrl = uploadResult;
    }

    const result = await prisma.porter.create({
      data: { name, photo: photoUrl },
      select: { id: true, name: true, photo: true },
    });

    return result;
  }

  static async updatePorter(request) {
    const { id } = request.params;
    const { name } = request.body;

    Validation.validate(PorterValidation.updatePorterSchema, { name });

    const existingPorter = await prisma.porter.findUnique({
      where: { id: Number(id) },
      select: { photo: true },
    });

    if (!existingPorter) throw new ResponseError("Porter tidak ditemukan", 404);

    if (
      request.file &&
      !["image/jpeg", "image/jpg", "image/png"].includes(request.file.mimetype)
    ) {
      throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
    }

    if (request.file && request.file.size > 2 * 1024 * 1024) {
      throw new ResponseError("Ukuran foto maksimal 2MB", 400);
    }

    let photoUrl = existingPorter.photo;
    if (request.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "porters" }, (error, result) => {
            if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
            else resolve(result.secure_url);
          })
          .end(request.file.buffer);
      });

      photoUrl = uploadResult;
    }

    const result = await prisma.porter.update({
      where: { id: Number(id) },
      data: { name, photo: photoUrl },
      select: { id: true, name: true, photo: true },
    });

    return result;
  }

  static async getAllPorters(request) {
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

    const totalData = await prisma.porter.count({
      where: filter,
    });

    const result = await prisma.porter.findMany({
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
      porters: result,
      pagination: {
        limit: limitNumber,
        current_page: pageNumber,
        last_page: lastPage,
        total_data: totalData,
      },
    };
  }

  static async getPorterById(id) {
    const result = await prisma.porter.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true, photo: true },
    });

    if (!result) throw new ResponseError("Porter tidak ditemukan", 404);

    return result;
  }

  static async deletePorter(id) {
    const porter = await prisma.porter.findUnique({
      where: { id: Number(id) },
    });

    if (!porter) throw new ResponseError("Porter tidak ditemukan", 404);

    await prisma.porter.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = PorterService;