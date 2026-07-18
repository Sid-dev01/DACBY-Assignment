const mongoose = require("mongoose");

const { SCHEDULER_LOG_STATUS } = require('../constants/order.constant')

const schedulerLogSchema = new mongoose.Schema(
    {
        startedAt: {
            type: Date,
            required: true,
        },
        endedAt: {
            type: Date,
            required: true,
        },
        durationInMs: {
            type: Number,
            required: true,
        },
        totalOrdersChecked: {
            type: Number,
            default: 0,
        },
        updatedOrders: {
            type: Number,
            default: 0,
        },
        failedOrders: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: Object.values(SCHEDULER_LOG_STATUS),
            required: true,
        },
        errorMessage: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "SchedulerLog",
    schedulerLogSchema
);