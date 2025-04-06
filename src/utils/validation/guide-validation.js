const { z } = require("zod");

class GuideValidation {
  static createGuideSchema = z.object({
    name: z
      .string()
      .min(2, "Nama minimum 2 characters")
      .max(50, "Nama maximum 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf dan spasi")
      .nonempty("Nama wajib diisi"),
  });

  static updateGuideSchema = z.object({
    name: z
      .string()
      .min(2, "Nama minimum 2 characters")
      .max(50, "Nama maximum 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf dan spasi")
      .optional(),
  });
}

module.exports = GuideValidation;