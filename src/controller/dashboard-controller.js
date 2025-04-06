const DashboardService = require("../service/dashboard-service");
const { successResponse } = require("../utils/response/response");

class DashboardController {
  async getDashboard(req, res, next) {
    try {
      const dashboardData = await DashboardService.getDashboardStats(req);
      return res
        .status(200)
        .json(
          successResponse("Berhasil mendapatkan data dashboard", dashboardData)
        );
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyTripStatistics(req, res, next) {
    try {
      const monthlyTripStats = await DashboardService.getMonthlyTripStatistics(
        req
      );
      return res
        .status(200)
        .json(
          successResponse(
            "Berhasil mendapatkan statistik trip bulanan",
            monthlyTripStats
          )
        );
    } catch (error) {
      next(error);
    }
  }

//   async generateMonthlyTripReport(req, res, next) {
//     try {
//       await DashboardService.generateMonthlyTripReport(req, res);
//     } catch (error) {
//       next(error);
//     }
//   }
}

module.exports = DashboardController;