const OrderService = require('../service/order.service');


class OrderController {

    async createOrder(req, res, next) {
        try{
            const order = await OrderService.createOrder(req.validateData.body);

            return res.status(201).json({
                success: true,
                message: "Order created successfully",
                data: order,
            });
        } catch (error) {
            next(error);
        }
    }
}


module.exports = new OrderController();