const mongoose = require("mongoose");

const { ORDER_STATUS } = require('../constants/order.constant');

const orderStatusHistorySchema  = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            index: true,
        },
        previousStatus: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            required: true,
        },
        currentStatus: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            required: true,
        },
        remarks: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("OrderStatusHistory", orderStatusHistorySchema);