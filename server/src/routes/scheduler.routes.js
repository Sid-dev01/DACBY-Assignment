const express = require("express");

const SchedulerController = require("../controllers/scheduler.controller");
const schedulerAuth = require("../middlewares/schedulerAuth.middleware");


const router = express.Router();

router.post(
    '/process-orders',
    schedulerAuth,
    SchedulerController.processOrders
)

module.exports = router;