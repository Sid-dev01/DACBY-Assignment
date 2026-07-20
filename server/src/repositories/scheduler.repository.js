const SchedulerLog = require("../models/schedulerLog");

class SchedulerRepository {
    async createSchedulerLog(logData) {
        return await SchedulerLog.create(logData);
    }

    async findSchedulerLogs(filters = {}, options = {}) {
        const { page, limit, sortBy, order } = options;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            SchedulerLog.find(filters)
                .sort({ [sortBy]: order })
                .skip(skip)
                .limit(limit),

            SchedulerLog.countDocuments(filters),
        ]);

        return {
            logs,
            total,
        };
    }
}

module.exports = new SchedulerRepository();
