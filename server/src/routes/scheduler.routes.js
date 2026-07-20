const express = require("express");

const SchedulerController = require("../controllers/scheduler.controller");
const schedulerAuth = require("../middlewares/schedulerAuth.middleware");
const validateRequest = require("../middlewares/validationRequest");
const { getSchedulerLogsSchema } = require("../validations/scheduler.validation");


const router = express.Router();

router.post(
    '/process-orders',
    schedulerAuth,
    SchedulerController.processOrders
)

router.get(
    '/logs',
    validateRequest(getSchedulerLogsSchema),
    SchedulerController.getSchedulerLogs
)

module.exports = router;