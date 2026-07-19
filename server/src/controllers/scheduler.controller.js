const SchedulerService = require("../service/scheduler.service");

class SchedulerController {

    async processOrders(req, res, next) {
        try {
            const result = await SchedulerService.processOrders();

            return res.status(200).json({
                success: true,
                message: "Scheduler executed successfully.",
                data: result,
            })
        } catch (error) {
            next(error);
        }
    }
}


module.exports = new SchedulerController();