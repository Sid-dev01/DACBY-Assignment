const { z } = require("zod");

const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants/order.constant')

const phoneRegex = /^[6-9]\d{9}$/;

const createOrderSchema = z.object({
    body: z.object({
        customerName: z
        .string()
        .trim()
        .min(2, {message: "Customer name must be at least 2 characters long"})
        .max(100, {message: "Customer name must be at most 100 characters long"}),

        phoneNumber: z
        .string()
        .regex(phoneRegex, { message: "Invalid phone number."}),

        productName: z
        .string()
        .trim()
        .min(2, {message: "Product name must be at least 2 characters long"})
        .max(150, {message: "Product name must be at most 150 characters long"}),

        amount: z.coerce
        .number()
        .positive({message: "Amount must be a positive number."}),

        paymentStatus: z
        .enum(Object.values(PAYMENT_STATUS))
        .optional(),

        status: z
        .enum(Object.values(ORDER_STATUS))
        .optional(),

    })
})

module.exports = {
    createOrderSchema
}