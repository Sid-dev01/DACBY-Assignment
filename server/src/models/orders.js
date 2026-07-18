const mongoose = require("mongoose");

const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants/order.constant');

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
            index: true,
            trim: true,
        },
        customerName: {
            type: String,
            required: true,
            trim: true,
            maxLength:100
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        productName: {
            type: String,
            required: true,
            trim: true,
            maxLength: 150,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING,
            index: true,
        },
        orderStatus: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PLACED,
            index: true,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("Order", orderSchema);