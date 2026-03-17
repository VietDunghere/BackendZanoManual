const { sendSuccess } = require('../../shared/utils/response');

class AdminStatsController {
    constructor(adminStatsService) {
        this.adminStatsService = adminStatsService;
    }

    async getSummary(req, res) {
        const result = await this.adminStatsService.getSummary();
        return sendSuccess(res, req, 200, result);
    }

    async exportStats(req, res) {
        const result = await this.adminStatsService.exportStats(req.query || {});
        return sendSuccess(res, req, 200, result);
    }
}

module.exports = { AdminStatsController };
