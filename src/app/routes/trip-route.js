const express = require("express");
const { jwtMiddleware } = require("../../utils/middleware/jwt");
const { isAdmin } = require("../../utils/middleware/admin-middleware");
const upload = require("../../utils/helper/multer");
const TripController = require("../../controller/trip-controller");

const tripController = new TripController();

const router = express.Router();

router.post(
  "/trips/open",
  jwtMiddleware,
  isAdmin,
  upload.single("mountain_photo"),
  tripController.createTrip.bind(tripController)
);

router.post(
  "/trips/private",
  jwtMiddleware,
  isAdmin,
  upload.single("mountain_photo"),
  tripController.createPrivateTrip.bind(tripController)
);

router.get("/trips/open", tripController.getAllOpenTrip.bind(tripController));

router.get(
  "/trips/private",
  tripController.getAllPrivateTrips.bind(tripController)
);

router.put(
  "/trips/open/:id_trip",
  jwtMiddleware,
  isAdmin,
  upload.single("mountain_photo"),
  tripController.updateTrip.bind(tripController)
);

router.get("/trips/:id", tripController.getTripById.bind(tripController));

router.delete(
  "/trips/:id",
  jwtMiddleware,
  isAdmin,
  tripController.deleteTripById.bind(tripController)
);

module.exports = router;
