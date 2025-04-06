const { z } = require("zod");

class FeedbackValidation {
  static createFeedbackSchema = z.object({
    id_trip_booking: z
      .number()
      .int("ID booking harus berupa angka bulat")
      .positive("ID booking harus lebih besar dari 0")
      .refine((val) => val > 0, {
        message: "ID booking wajib diisi",
      }),
    message: z
      .string()
      .min(10, "Pesan minimum 10 characters")
      .max(500, "Pesan maximum 500 characters")
      .nonempty("Pesan wajib diisi"),
    rating: z
      .number()
      .int("Rating harus berupa angka bulat")
      .positive("Rating harus lebih besar dari 0")
      .refine((val) => val >= 1 && val <= 5, {
        message: "Rating harus antara 1 dan 5",
      }),
  });
}

module.exports = FeedbackValidation;