const express = require('express');
const rateLimiter = require('../middlewares/rateLimiter');
const validateRequest = require('../middlewares/validationRequest');
const orderController = require('../controllers/order.controller');
const { createOrderSchema } = require('../validations/order.validation');

const router = express.Router();

router.post(
    '/create-order',
    rateLimiter(1, 10),
    validateRequest(createOrderSchema),
    orderController.createOrder
)

module.exports = router;