const PorterService = require("../service/porter-service");
const { successResponse } = require("../utils/response/response");

class PorterController {
  async createPorter(req, res, next) {
    try {
      const porter = await PorterService.createPorter(req);
      return res
        .status(201)
        .json(successResponse("Berhasil membuat porter", porter));
    } catch (error) {
      next(error);
    }
  }

  async updatePorter(req, res, next) {
    try {
      const porter = await PorterService.updatePorter(req);
      return res
        .status(200)
        .json(successResponse("Berhasil memperbarui porter", porter));
    } catch (error) {
      next(error);
    }
  }

  async getAllPorters(req, res, next) {
    try {
      const porters = await PorterService.getAllPorters(req);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan semua porter", porters));
    } catch (error) {
      next(error);
    }
  }

  async getPorterById(req, res, next) {
    try {
      const porter = await PorterService.getPorterById(req.params.id);
      return res
        .status(200)
        .json(successResponse("Berhasil mendapatkan porter", porter));
    } catch (error) {
      next(error);
    }
  }

  async deletePorter(req, res, next) {
    try {
      await PorterService.deletePorter(req.params.id);
      return res.status(200).json(successResponse("Berhasil menghapus porter"));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PorterController;
