const express = require("express");
const { jwtMiddleware } = require("../../utils/middleware/jwt");
const { isAdmin } = require("../../utils/middleware/admin-middleware");
const DashboardController = require("../../controller/dashboard-controller");

const dashboardController = new DashboardController();

const router = express.Router();

router.get(
  "/dashboard",
  jwtMiddleware,
  isAdmin,
  dashboardController.getDashboard.bind(dashboardController)
);

router.get(
  "/dashboard/monthly-trip-statistics",
  jwtMiddleware,
  isAdmin,
  dashboardController.getMonthlyTripStatistics.bind(dashboardController)
);

// router.get(
//   "/reports/monthly-trip-statistics",
//     dashboardController.generateMonthlyTripReport.bind(dashboardController)
// );

module.exports = router;
