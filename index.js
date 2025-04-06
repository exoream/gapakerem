const express = require("express");
const userRoute = require("./src/app/routes/user-route");
const guideRoute = require("./src/app/routes/guide-route");
const porterRoute = require("./src/app/routes/porter-route");
const tripRoute = require("./src/app/routes/trip-route");
const bookingRoute = require("./src/app/routes/booking-route");
const feedbackRoute = require("./src/app/routes/feedback-route");
const dashboardRoute = require("./src/app/routes/dashboard-route");
const cors = require("cors");
const errorMiddleware = require("./src/utils/middleware/error-middleware");

const app = express();

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Gapakerem",
  });
});

app.use("", userRoute);
app.use("", guideRoute);
app.use("", porterRoute);
app.use("", tripRoute);
app.use("", bookingRoute);
app.use("", feedbackRoute);
app.use("", dashboardRoute);

app.use(errorMiddleware);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
