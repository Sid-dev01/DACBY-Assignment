const { z } = require("zod");

const { PAGINATION } = require('../constants/pagination.constant')
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

const getOrderSchema = z.object({
    query: z.object({
        page:z.coerce
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

        orderStatus: z
        .enum(Object.values(ORDER_STATUS))
        .optional(),

        paymentStatus: z
        .enum(Object.values(PAYMENT_STATUS))
        .optional(),

        sortBy: z
        .enum([
            "createdAt",
            "amount",
            "customerName",
            "orderStatus",
            "paymentStatus",
        ])
        .optional(),

        order: z
        .enum(["asc", "desc"])
        .optional(),
    })
});

const getOrderByIdSchema = z.object({
    params: z.object({
        orderId: z
        .string()
        .trim()
        .min(1, "OrderId is required"),
    })
})

module.exports = {
    createOrderSchema,
    getOrderSchema,
    getOrderByIdSchema,
}