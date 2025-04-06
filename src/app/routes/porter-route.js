const express = require("express");
const PorterController = require("../../controller/porter-controller");
const { jwtMiddleware } = require("../../utils/middleware/jwt");
const { isAdmin } = require("../../utils/middleware/admin-middleware");
const upload = require("../../utils/helper/multer");

const porterController = new PorterController();

const router = express.Router();

router.post(
  "/porters",
  jwtMiddleware,
  isAdmin,
  upload.single("photo"),
  porterController.createPorter.bind(porterController)
);

router.put(
  "/porters/:id",
  jwtMiddleware,
  isAdmin,
  upload.single("photo"),
  porterController.updatePorter.bind(porterController)
);

router.get(
  "/porters",
  porterController.getAllPorters.bind(porterController)
);

router.get(
  "/porters/:id",
  porterController.getPorterById.bind(porterController)
);

router.delete(
  "/porters/:id",
  jwtMiddleware,
  isAdmin,
  porterController.deletePorter.bind(porterController)
);

module.exports = router;
