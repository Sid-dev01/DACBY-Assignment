const express = require('express');
const rateLimiter = require('../middlewares/rateLimiter');
const validateRequest = require('../middlewares/validationRequest');
const orderController = require('../controllers/order.controller');
const { createOrderSchema, getOrderSchema, getOrderByIdSchema } = require('../validations/order.validation');

const router = express.Router();

router.post(
    '/create-order',
    rateLimiter(1, 10),
    validateRequest(createOrderSchema),
    orderController.createOrder
)

router.get(
    '/get-orders',
    rateLimiter(1, 30),
    validateRequest(getOrderSchema),
    orderController.getOrders
)

router.get(
    '/get-order/:orderId',
    rateLimiter(1, 30),
    validateRequest(getOrderByIdSchema),
    orderController.getOrderById
)

module.exports = router;