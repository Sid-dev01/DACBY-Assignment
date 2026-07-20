const cron = require("node-cron");
const SchedulerService = require("./service/scheduler.service")


cron.schedule("*/5 * * * *", async () => {

    try{
        await SchedulerService.processOrders();
    } catch(err) {
        console.error(err);
    }
});