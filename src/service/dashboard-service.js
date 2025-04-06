const prisma = require("../app/config/config");
const { ResponseError } = require("../utils/response/response");
const PDFDocument = require("pdfkit");
const moment = require("moment");

class DashboardService {
  static async getDashboardStats() {
    // Jumlah trip (bukan booking) berdasarkan jenis
    const openTripCount = await prisma.trip.count({
      where: { trip_type: "open" },
    });

    const privateTripCount = await prisma.trip.count({
      where: { trip_type: "private" },
    });

    // Jumlah transaksi berdasarkan tipe trip
    const openTripTransactions = await prisma.tripBooking.count({
      where: { trip_type: "open" },
    });

    const privateTripTransactions = await prisma.tripBooking.count({
      where: { trip_type: "private" },
    });

    // Jumlah peserta berdasarkan tipe trip
    const openTripParticipants = await prisma.tripBooking.aggregate({
      _sum: { total_participants: true },
      where: { trip_type: "open" },
    });

    const privateTripParticipants = await prisma.tripBooking.aggregate({
      _sum: { total_participants: true },
      where: { trip_type: "private" },
    });

    // Jumlah status pembayaran
    const unpaidCount = await prisma.tripBooking.count({
      where: { payment_status: "unpaid" },
    });

    const paidCount = await prisma.tripBooking.count({
      where: { payment_status: "paid" },
    });

    // Total pendapatan dari booking yang sudah dibayar
    const totalRevenue = await prisma.tripBooking.aggregate({
      _sum: { total_price: true },
      where: { payment_status: "approved" },
    });

    return {
      total_open_trip: openTripCount,
      total_private_trip: privateTripCount,
      total_open_trip_transactions: openTripTransactions,
      total_private_trip_transactions: privateTripTransactions,
      total_open_trip_participants:
        openTripParticipants._sum.total_participants || 0,
      total_private_trip_participants:
        privateTripParticipants._sum.total_participants || 0,
      total_unpaid: unpaidCount,
      total_paid: paidCount,
      total_revenue: totalRevenue._sum.total_price || 0,
    };
  }

  static async getMonthlyTripStatistics(request) {
    const { month, year } = request.query;

    if (!month || !year) {
      throw new ResponseError("Bulan dan tahun harus diisi", 400);
    }

    // Validasi bulan dan tahun
    if (month < 1 || month > 12) {
      throw new ResponseError("Bulan tidak valid. Harus antara 1 dan 12.", 400);
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const openTripStats = (
      await prisma.$queryRaw`
  SELECT
    t.mountain_name,
    SUM(tb.total_participants) AS total_participants,
    SUM(tb.total_price) AS total_price
  FROM
    trip_bookings tb
    JOIN trips t ON tb.id_trip = t.id
  WHERE
    tb.trip_type = 'open'
    AND tb.payment_status = 'approved'
    AND tb.created_at BETWEEN ${startDate} AND ${endDate}
  GROUP BY
    t.mountain_name`
    ).map((trip) => ({
      ...trip,
      total_participants: Number(trip.total_participants),
      total_price: Number(trip.total_price),
    }));

    const privateTripStats = (
      await prisma.$queryRaw` 
      SELECT
        t.mountain_name,
        SUM(tb.total_participants) AS total_participants,
        SUM(tb.total_price) AS total_price
      FROM
        trip_bookings tb
        JOIN trips t ON tb.id_trip = t.id
      WHERE
        tb.trip_type = 'private'
        AND tb.payment_status = 'approved'
        AND tb.created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY
        t.mountain_name`
    ).map((trip) => ({
      ...trip,
      total_participants: Number(trip.total_participants),
      total_price: Number(trip.total_price),
    }));

    // Menghitung total keseluruhan untuk Open Trip
    const totalOpenTripPrice = openTripStats.reduce(
      (acc, trip) => acc + trip.total_price,
      0
    );
    const totalOpenTrips = openTripStats.length;

    // Menghitung total keseluruhan untuk Private Trip
    const totalPrivateTripPrice = privateTripStats.reduce(
      (acc, trip) => acc + trip.total_price,
      0
    );
    const totalPrivateTrips = privateTripStats.length;

    return {
      open_trip: {
        trips: openTripStats,
        total_price: totalOpenTripPrice,
        total_trips: totalOpenTrips,
      },
      private_trip: {
        trips: privateTripStats,
        total_price: totalPrivateTripPrice,
        total_trips: totalPrivateTrips,
      },
    };
  }

//   static async generateMonthlyTripReport(req, res) {
//     try {
//       const { month, year } = req.query;

//       // Fetch the statistics data
//       const statsData = await DashboardService.getMonthlyTripStatistics(req);

//       // Create a new PDF document
//       const doc = new PDFDocument({ margin: 50 });

//       // Set up the response
//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename=monthly-trip-report-${month}-${year}.pdf`
//       );

//       // Pipe the PDF to the response
//       doc.pipe(res);

//       // Format the month name properly
//       const monthName = moment(`${year}-${month}-01`).format("MMMM");

//       // Add company logo (you'd need to replace this with your actual logo path)
//       // doc.image('path/to/logo.png', 50, 45, { width: 100 });

//       // Add title and date
//       doc
//         .fontSize(20)
//         .text(`LAPORAN STATISTIK PERJALANAN BULANAN`, { align: "center" });
//       doc.moveDown(0.5);
//       doc.fontSize(16).text(`${monthName} ${year}`, { align: "center" });
//       doc.moveDown(1);

//       // Add the date generated
//       doc
//         .fontSize(10)
//         .text(`Tanggal Laporan: ${moment().format("DD MMMM YYYY, HH:mm")}`, {
//           align: "right",
//         });
//       doc.moveDown(2);

//       // Ringkasan / Summary
//       doc.fontSize(14).text("RINGKASAN", { underline: true });
//       doc.moveDown(0.5);

//       // Add summary table
//       const summaryTableTop = doc.y;
//       doc.fontSize(10);

//       // Define table layout
//       const summaryTableLayout = {
//         prepareHeader: () => doc.font("Helvetica-Bold"),
//         prepareRow: () => doc.font("Helvetica"),
//       };

//       // Build the summary data
//       const summaryTableData = [
//         ["Tipe Trip", "Jumlah Trip", "Total Peserta", "Total Pendapatan"],
//         [
//           "Open Trip",
//           statsData.open_trip.total_trips.toString(),
//           statsData.open_trip.trips
//             .reduce((sum, t) => sum + t.total_participants, 0)
//             .toString(),
//           `Rp ${statsData.open_trip.total_price.toLocaleString("id-ID")}`,
//         ],
//         [
//           "Private Trip",
//           statsData.private_trip.total_trips.toString(),
//           statsData.private_trip.trips
//             .reduce((sum, t) => sum + t.total_participants, 0)
//             .toString(),
//           `Rp ${statsData.private_trip.total_price.toLocaleString("id-ID")}`,
//         ],
//         [
//           "Total",
//           (
//             statsData.open_trip.total_trips + statsData.private_trip.total_trips
//           ).toString(),
//           (
//             statsData.open_trip.trips.reduce(
//               (sum, t) => sum + t.total_participants,
//               0
//             ) +
//             statsData.private_trip.trips.reduce(
//               (sum, t) => sum + t.total_participants,
//               0
//             )
//           ).toString(),
//           `Rp ${(
//             statsData.open_trip.total_price + statsData.private_trip.total_price
//           ).toLocaleString("id-ID")}`,
//         ],
//       ];

//       // Draw the summary table
//       this.drawTable(doc, summaryTableLayout, summaryTableData);
//       doc.moveDown(2);

//       // ----------------- OPEN TRIP DETAILS -----------------
//       doc.fontSize(14).text("DETAIL OPEN TRIP", { underline: true });
//       doc.moveDown(0.5);

//       if (statsData.open_trip.trips.length === 0) {
//         doc.fontSize(10).text("Tidak ada data open trip untuk periode ini.");
//       } else {
//         // Define table layout for open trips
//         const openTripTableLayout = {
//           prepareHeader: () => doc.font("Helvetica-Bold"),
//           prepareRow: () => doc.font("Helvetica"),
//         };

//         // Build the open trip data
//         const openTripTableData = [
//           ["No", "Gunung", "Jumlah Peserta", "Total Pendapatan"],
//           ...statsData.open_trip.trips.map((trip, index) => [
//             (index + 1).toString(),
//             trip.mountain_name,
//             trip.total_participants.toString(),
//             `Rp ${trip.total_price.toLocaleString("id-ID")}`,
//           ]),
//         ];

//         // Draw the open trip table
//         this.drawTable(doc, openTripTableLayout, openTripTableData);
//       }

//       doc.moveDown(2);

//       // Check if we need a new page for private trip details
//       if (doc.y > 600) {
//         doc.addPage();
//       }

//       // ----------------- PRIVATE TRIP DETAILS -----------------
//       doc.fontSize(14).text("DETAIL PRIVATE TRIP", { underline: true });
//       doc.moveDown(0.5);

//       if (statsData.private_trip.trips.length === 0) {
//         doc.fontSize(10).text("Tidak ada data private trip untuk periode ini.");
//       } else {
//         // Define table layout for private trips
//         const privateTripTableLayout = {
//           prepareHeader: () => doc.font("Helvetica-Bold"),
//           prepareRow: () => doc.font("Helvetica"),
//         };

//         // Build the private trip data
//         const privateTripTableData = [
//           ["No", "Gunung", "Jumlah Peserta", "Total Pendapatan"],
//           ...statsData.private_trip.trips.map((trip, index) => [
//             (index + 1).toString(),
//             trip.mountain_name,
//             trip.total_participants.toString(),
//             `Rp ${trip.total_price.toLocaleString("id-ID")}`,
//           ]),
//         ];

//         // Draw the private trip table
//         this.drawTable(doc, privateTripTableLayout, privateTripTableData);
//       }

//       // Add a footer with page numbers
//       const pages = doc.bufferedPageRange();
//       for (let i = 0; i < pages.count; i++) {
//         doc.switchToPage(i);
//         // Add page number
//         doc
//           .fontSize(8)
//           .text(
//             `Halaman ${i + 1} dari ${pages.count}`,
//             0,
//             doc.page.height - 50,
//             { align: "center" }
//           );
//       }

//       // Finalize the PDF
//       doc.end();

//       return true;
//     } catch (error) {
//       console.error("Error generating PDF report:", error);
//       throw error;
//     }
//   }

//   // Helper method to draw tables
//   static drawTable(doc, tableLayout, tableData) {
//     const startX = 50;
//     const startY = doc.y;
//     const rowHeight = 20;
//     const colWidths = [40, 200, 100, 150]; // Adjust these widths as needed

//     // Draw table headers
//     let yPos = startY;

//     // Prepare header style
//     tableLayout.prepareHeader();

//     // Draw header row
//     doc.y = yPos;
//     tableData[0].forEach((text, i) => {
//       doc.text(
//         text.toString(),
//         startX + (i > 0 ? colWidths.slice(0, i).reduce((a, b) => a + b, 0) : 0),
//         yPos,
//         {
//           width: colWidths[i],
//           align: i > 1 ? "right" : "left",
//         }
//       );
//     });

//     // Draw a line under the header
//     yPos += rowHeight;
//     doc
//       .moveTo(startX, yPos)
//       .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), yPos)
//       .stroke();

//     // Prepare row style
//     tableLayout.prepareRow();

//     // Draw rows
//     for (let i = 1; i < tableData.length; i++) {
//       yPos += rowHeight;

//       // Check if we need a new page
//       if (yPos > doc.page.height - 100) {
//         doc.addPage();
//         yPos = 50;

//         // Redraw header on new page
//         tableLayout.prepareHeader();
//         doc.y = yPos;
//         tableData[0].forEach((text, j) => {
//           doc.text(
//             text.toString(),
//             startX +
//               (j > 0 ? colWidths.slice(0, j).reduce((a, b) => a + b, 0) : 0),
//             yPos,
//             {
//               width: colWidths[j],
//               align: j > 1 ? "right" : "left",
//             }
//           );
//         });

//         // Draw a line under the header
//         yPos += rowHeight;
//         doc
//           .moveTo(startX, yPos)
//           .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), yPos)
//           .stroke();

//         // Prepare row style again
//         tableLayout.prepareRow();
//       }

//       // Draw row
//       doc.y = yPos;
//       tableData[i].forEach((text, j) => {
//         doc.text(
//           text.toString(),
//           startX +
//             (j > 0 ? colWidths.slice(0, j).reduce((a, b) => a + b, 0) : 0),
//           yPos,
//           {
//             width: colWidths[j],
//             align: j > 1 ? "right" : "left",
//           }
//         );
//       });

//       // Draw a line under the row
//       if (i === tableData.length - 1) {
//         doc
//           .moveTo(startX, yPos + rowHeight)
//           .lineTo(
//             startX + colWidths.reduce((a, b) => a + b, 0),
//             yPos + rowHeight
//           )
//           .stroke();
//       }
//     }

//     // Update the y position for the next element
//     doc.y = yPos + rowHeight + 10;
//   }
}

module.exports = DashboardService;
