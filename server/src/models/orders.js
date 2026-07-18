const mongoose = require("mongoose");

const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants/order.constant');

const orderItemSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

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
        phoneNumber: {
            type: String,
            required: true,
            trim: true
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Order must contain at least one item.",
            },
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