const { z, number } = require("zod");

class UserValidation {
  static registerSchema = z.object({
    username: z
      .string()
      .min(5, "Username minimum 5 characters")
      .max(20, "Username maximum 20 characters")
      .nonempty("Username wajib diisi"),
    name: z
      .string()
      .min(2, "Nama minimum 2 characters")
      .max(50, "Nama maximum 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf dan spasi")
      .nonempty("Nama wajib diisi"),
    password: z
      .string()
      .min(8, "Password minimum 8 characters")
      .nonempty("Password wajib diisi"),
    email: z.string().email("Email tidak valid").nonempty("Email wajib diisi"),
    number: z
      .string()
      .regex(/^\d+$/, "No HP harus berupa angka")
      .nonempty("No HP wajib diisi"),
  });

  static loginSchema = z.object({
    username: z
      .string()
      .min(5, "Username minimum 5 characters")
      .max(20, "Username maximum 20 characters")
      .nonempty("Username wajib diisi"),
    password: z.string().nonempty("Password wajib diisi"),
  });

  static updateProfileSchema = z.object({
    username: z
      .string()
      .min(5, "Username minimum 5 characters")
      .max(20, "Username maximum 20 characters")
      .optional(),
    name: z
      .string()
      .min(2, "Nama minimum 2 characters")
      .max(50, "Nama maximum 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf dan spasi")
      .optional(),
    email: z.string().email("Email tidak valid").optional(),
    number: z
      .string()
      .regex(/^\d+$/, "No HP harus berupa angka")
      .optional(),
  });
}

module.exports = UserValidation;
