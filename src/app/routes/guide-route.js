const express = require("express");
const GuideController = require("../../controller/guide-controller");
const { jwtMiddleware } = require("../../utils/middleware/jwt");
const { isAdmin } = require("../../utils/middleware/admin-middleware");
const upload = require("../../utils/helper/multer");

const guideController = new GuideController();

const router = express.Router();

router.post(
  "/guides",
  jwtMiddleware,
  isAdmin,
  upload.single("photo"),
  guideController.createGuide.bind(guideController)
);

router.put(
  "/guides/:id",
  jwtMiddleware,
  isAdmin,
  upload.single("photo"),
  guideController.updateGuide.bind(guideController)
);

router.get(
  "/guides",
  guideController.getAllGuides.bind(guideController)
);

router.get(
  "/guides/:id",
  guideController.getGuideById.bind(guideController)
);

router.delete(
  "/guides/:id",
  jwtMiddleware,
  isAdmin,
  guideController.deleteGuide.bind(guideController)
);
module.exports = router;
