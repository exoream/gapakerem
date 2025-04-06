const GuideService = require("../service/guide-service");
const { successResponse } = require("../utils/response/response");

class GuideController {
    async createGuide(req, res, next) {
        try {
            const guide = await GuideService.createGuide(req);
            return res.status(201).json(successResponse("Berhasil membuat guide", guide));
        } catch (error) {
            next(error);
        }
    }

    async updateGuide(req, res, next) {
        try {
            const guide = await GuideService.updateGuide(req);
            return res.status(200).json(successResponse("Berhasil memperbarui guide", guide));
        } catch (error) {
            next(error);
        }
    }

    async getAllGuides(req, res, next) {
        try {
            const guides = await GuideService.getAllGuides(req);
            return res.status(200).json(successResponse("Berhasil mendapatkan semua guide", guides));
        } catch (error) {
            next(error);
        }
    }

    async getGuideById(req, res, next) {
        try {
            const guide = await GuideService.getGuideById(req.params.id);
            return res.status(200).json(successResponse("Berhasil mendapatkan guide", guide));
        } catch (error) {
            next(error);
        }
    }

    async deleteGuide(req, res, next) {
        try {
            await GuideService.deleteGuide(req.params.id);
            return res.status(200).json(successResponse("Berhasil menghapus guide"));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = GuideController;