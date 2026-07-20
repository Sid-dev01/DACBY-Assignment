const { z } = require("zod");

const { PAGINATION } = require("../constants/pagination.constant");
const { SCHEDULER_STATUS } = require("../constants/scheduler.constant");

const getSchedulerLogsSchema = z.object({
    query: z.object({
        page: z.coerce
            .number()
            .int()
            .positive()
            .optional(),

        limit: z.coerce
            .number()
            .int()
            .positive()
            .max(PAGINATION.MAX_LIMIT)
            .optional(),

        status: z
            .enum(Object.values(SCHEDULER_STATUS))
            .optional(),

        sortBy: z
            .enum([
                "createdAt",
                "startedAt",
                "endedAt",
                "durationInMs",
                "totalOrdersChecked",
                "totalOrdersUpdated",
                "failedOrders",
                "status",
            ])
            .optional(),

        order: z
            .enum(["asc", "desc"])
            .optional(),
    })
});

module.exports = {
    getSchedulerLogsSchema,
};
