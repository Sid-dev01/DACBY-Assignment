const { z } = require("zod");

const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants/order.constant')

const phoneRegex = /^[6-9]\d{9}$/;

const orderItemSchema = z.object({
    productName: z
        .string()
        .trim()
        .min(2)
        .max(150),

    quantity: z.coerce
        .number()
        .int()
        .positive(),

    price: z.coerce
        .number()
        .positive(),
});

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

        items: z
        .array(orderItemSchema)
        .min(1, {
            message: "Order must contain at least one item.",
        }),

        paymentStatus: z
        .enum(Object.values(PAYMENT_STATUS))
        .optional(),

        orderStatus: z
        .enum(Object.values(ORDER_STATUS))
        .optional(),

    })
})

module.exports = {
    createOrderSchema
}