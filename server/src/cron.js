const cron = require("node-cron");
const SchedulerService = require("./service/scheduler.service")


cron.schedule("*/5 * * * *", async () => {
    console.log("Running Order Scheduler.");

    try{
        await SchedulerService.processOrders();
        console.log("Scheduler completed");
    } catch(err) {
        console.error(err);
    }
});