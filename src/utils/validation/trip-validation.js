const { z } = require("zod");

class TripValidation {
  static createTripSchema = z.object({
    mountain_name: z
      .string()
      .min(2, "Nama minimum 2 characters")
      .max(50, "Nama maximum 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf dan spasi")
      .nonempty("Nama gunung wajib diisi"),
    description: z
      .string()
      .min(10, "Deskripsi minimum 10 karakter")
      .max(500, "Deskripsi maksimum 500 karakter")
      .nonempty("Deskripsi wajib diisi"),
    equipment: z
      .string()
      .min(10, "Peralatan minimum 10 karakter")
      .max(500, "Peralatan maksimum 500 karakter")
      .nonempty("Peralatan wajib diisi"),
    estimation_time: z
      .string()
      .min(5, "Perkiraan waktu minimum 5 karakter")
      .max(100, "Perkiraan waktu maksimum 100 karakter")
      .nonempty("Perkiraan waktu wajib diisi"),
    price: z
      .number()
      .positive("Harga harus lebih besar dari 0")
      .refine((val) => val > 0, {
        message: "Harga wajib diisi",
      }),
    trip_type: z.enum(["open", "private"], {
      errorMap: () => ({ message: "Tipe trip wajib diisi" }),
    }),
  });

  static createOpenTripSchema = z.object({
    id_guide: z
      .number()
      .int("ID guide harus berupa angka bulat")
      .positive("ID guide harus lebih besar dari 0")
      .refine((val) => val > 0, {
        message: "ID guide wajib diisi",
      }),
    traveling_time: z
      .string()
      .min(1, "Waktu perjalanan harus diisi")
      .nonempty("Waktu perjalanan wajib diisi"),
    agenda: z
      .string()
      .min(1, "Agenda harus diisi")
      .nonempty("Agenda wajib diisi"),
    porters: z.array(z.number().positive()).nonempty("Porter wajib diisi"),
  });

  static createPrivateTripSchema = z.object({
    price_per_day: z
      .number()
      .positive("Harga harus lebih besar dari 0")
      .refine((val) => val > 0, {
        message: "Harga wajib diisi",
      }),
  });

  static updateTripSchema = z.object({
    mountain_name: z
      .string()
      .min(2, "Nama minimum 2 characters")
      .max(50, "Nama maximum 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf dan spasi")
      .optional(),
    description: z
      .string()
      .min(10, "Deskripsi minimum 10 karakter")
      .max(500, "Deskripsi maksimum 500 karakter")
      .optional(),
    equipment: z
      .string()
      .min(10, "Peralatan minimum 10 karakter")
      .max(500, "Peralatan maksimum 500 karakter")
      .optional(),
    estimation_time: z
      .string()
      .min(5, "Perkiraan waktu minimum 5 karakter")
      .max(100, "Perkiraan waktu maksimum 100 karakter")
      .optional(),
    price: z
      .number()
      .positive("Harga harus lebih besar dari 0")
      .refine((val) => val > 0, {
        message: "Harga opsional",
      })
      .optional(),
    trip_type: z.enum(["open", "private"], {
      errorMap: () => ({ message: "Tipe trip opsional" }),
    }).optional(),
  });

  static updateOpenTripSchema = z.object({
    id_guide: z
      .number()
      .int("ID guide harus berupa angka bulat")
      .positive("ID guide harus lebih besar dari 0")
      .optional(),
    traveling_time: z
      .string()
      .min(1, "Waktu perjalanan harus diisi")
      .optional(),
    agenda: z.string().optional(),
    porters: z.array(z.number().positive()).optional(),
  });
}


module.exports = TripValidation;