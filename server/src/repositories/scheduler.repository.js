const SchedulerLog = require("../models/schedulerLog");

class SchedulerRepository {
    async createSchedulerLog(logData) {
        return await SchedulerLog.create(logData);
    }
}

module.exports = new SchedulerRepository();