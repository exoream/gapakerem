const prisma = require("../app/config/config");
const { createToken } = require("../utils/middleware/jwt");
const { ResponseError } = require("../utils/response/response");
const UserValidation = require("../utils/validation/user-validation");
const Validation = require("../utils/validation/validation");
const cloudinary = require("../app/config/cloudinary");
const bcrypt = require("bcrypt");

class UserService {
  static async register(request) {
    const user = Validation.validate(UserValidation.registerSchema, request);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    if (existingUser) {
      throw new ResponseError("Email sudah terdaftar", 400);
    }

    const existingUsername = await prisma.user.findUnique({
      where: {
        username: user.username,
      },
    });

    if (existingUsername) {
      throw new ResponseError("Username sudah terdaftar", 400);
    }

    const existingNoHp = await prisma.user.findUnique({
      where: {
        number: user.number,
      },
    });

    if (existingNoHp) {
      throw new ResponseError("No HP sudah terdaftar", 400);
    }

    user.password = await bcrypt.hash(user.password, 10);

    const result = await prisma.user.create({
      data: user,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        number: true,
      },
    });

    return result;
  }

  static async login(request) {
    const user = Validation.validate(UserValidation.loginSchema, request);

    const existingUser = await prisma.user.findUnique({
      where: {
        username: user.username,
      },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
      },
    });

    if (!existingUser) {
      throw new ResponseError("Username tidak terdaftar", 400);
    }

    const isPasswordValid = await bcrypt.compare(
      user.password,
      existingUser.password
    );

    if (!isPasswordValid) {
      throw new ResponseError("Username atau password salah", 400);
    }

    const token = createToken(existingUser.id, existingUser.role);

    return {
      id: existingUser.id,
      username: existingUser.username,
      token: token,
    };
  }

  static updateProfile = async (request) => {
    const userId = request.user.id;

    const user = Validation.validate(
      UserValidation.updateProfileSchema,
      request.body
    );

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new ResponseError("User tidak ditemukan", 404);
    }

    if (user.username) {
      const existingUsername = await prisma.user.findUnique({
        where: {
          username: user.username,
          id: { not: userId },
        },
      });

      if (existingUsername) {
        throw new ResponseError("Username sudah terdaftar", 400);
      }
    }

    if (user.email) {
      const existingEmail = await prisma.user.findUnique({
        where: {
          email: user.email,
          id: { not: userId },
        },
      });

      if (existingEmail) {
        throw new ResponseError("Email sudah terdaftar", 400);
      }
    }

    if (user.number) {
      const existingNoHp = await prisma.user.findUnique({
        where: {
          number: user.number,
          id: { not: userId },
        },
      });

      if (existingNoHp) {
        throw new ResponseError("No HP sudah terdaftar", 400);
      }
    }

    if (
      request.file &&
      !["image/jpeg", "image/jpg", "image/png"].includes(request.file.mimetype)
    ) {
      throw new ResponseError("Format foto harus JPG, JPEG, atau PNG", 400);
    }

    if (request.file && request.file.size > 2 * 1024 * 1024) {
      throw new ResponseError("Ukuran foto maksimal 2MB", 400);
    }

    let photoUrl = existingUser.photo;
    if (request.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "users" }, (error, result) => {
            if (error) reject(new ResponseError("Gagal mengunggah foto", 500));
            else resolve(result.secure_url);
          })
          .end(request.file.buffer);
      });

      photoUrl = uploadResult;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: user.username,
        name: user.name,
        email: user.email,
        number: user.number,
        photo: photoUrl,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        number: true,
        photo: true,
      },
    });

    return updatedUser;
  };

  static async getProfile(request) {
    const userId = request.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        number: true,
        photo: true,
      },
    });

    if (!user) {
      throw new ResponseError("User tidak ditemukan", 404);
    }

    return user;
  }

  static async updatePassword(request) {
    const userId = request.user.id;

    const { old_password: oldPassword, new_password: newPassword } =
      request.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new ResponseError("User tidak ditemukan", 404);
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      existingUser.password
    );

    if (!isPasswordValid) {
      throw new ResponseError("Password lama salah", 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        number: true,
        photo: true,
      },
    });

    return updatedUser;
  }

  static async getAllUsers(request) {
    const { page, limit, search } = request.query;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    const filter = search
      ? {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              username: {
                contains: search,
              },
            },
            {
              email: {
                contains: search,
              },
            },
            {
              number: {
                contains: search,
              },
            },
          ],
        }
      : {};

    const totalData = await prisma.user.count({
      where: filter,
    });

    const result = await prisma.user.findMany({
      where: filter,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        number: true,
        photo: true,
      },
    });

    const lastPage = Math.ceil(totalData / limitNumber);

    return {
      users: result,
      pagination: {
        limit: limitNumber,
        current_page: pageNumber,
        last_page: lastPage,
        total_data: totalData,
      },
    };
  }

  static async getUserById(request) {
    const { id } = request.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        number: true,
        photo: true,
      },
    });

    if (!user) {
      throw new ResponseError("User tidak ditemukan", 404);
    }

    return user;
  }
}

module.exports = UserService;
