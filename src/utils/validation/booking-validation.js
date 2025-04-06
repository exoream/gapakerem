const { z } = require("zod");

class BookingValidation {
  static createBookingSchema = z.object({
    id_trip: z
      .number()
      .int("ID trip harus berupa angka bulat")
      .positive("ID trip harus lebih besar dari 0")
      .refine((val) => val > 0, {
        message: "ID trip wajib diisi",
      }),
    total_participants: z
      .number()
      .int("Jumlah peserta harus berupa angka bulat")
      .positive("Jumlah peserta harus lebih besar dari 0")
      .refine((val) => val > 0, {
        message: "Jumlah peserta wajib diisi",
      }),
    name_participants: z
      .string()
      .min(2, "Nama minimum 2 characters")
      .regex(
        /^[a-zA-Z\s,]+$/,
        "Nama hanya boleh mengandung huruf, spasi, dan koma"
      )
      .refine((val) => val.split(",").length > 0, {
        message: "Nama peserta minimal satu orang",
      }),
    no_hp: z
      .string()
      .min(10, "Nomor HP minimum 10 characters")
      .max(15, "Nomor HP maximum 15 characters")
      .regex(/^[0-9]+$/, "Nomor HP hanya boleh mengandung angka")
      .nonempty("Nomor HP wajib diisi"),
    meeting_point: z
      .string()
      .min(5, "Meeting point minimum 5 characters")
      .max(100, "Meeting point maximum 100 characters")
      .nonempty("Meeting point wajib diisi"),
  });

  static createSchemaPrivateTrip = z.object({
    id_guide: z
      .number()
      .int("ID guide harus berupa angka bulat")
      .positive("ID guide harus lebih besar dari 0")
      .refine((val) => val > 0, {
        message: "ID guide wajib diisi",
      }),
    total_days: z
      .number()
      .positive("Jumlah hari harus lebih besar dari 0")
      .int("Jumlah hari harus berupa angka bulat")
      .refine((val) => val > 0, {
        message: "Jumlah hari wajib diisi",
      }),
    start_date: z
      .string()
      .min(10, "Tanggal mulai minimum 10 characters")
      .max(10, "Tanggal mulai maximum 10 characters")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid")
      .refine((val) => new Date(val) >= new Date(), {
        message: "Tanggal mulai tidak boleh di masa lalu",
      }),
    porters: z.array(z.number().positive()).nonempty("Porter wajib diisi"),
  });
}

module.exports = BookingValidation;
