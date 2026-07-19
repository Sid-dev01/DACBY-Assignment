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

    async getOrders(req, res, next) {
        try{
            const orders = await OrderService.getOrders(req.validateData.query);

            return res.status(200).json({
                success: true,
                message: "Orders fetched successfully.",
                data: orders,
            })
        } catch (error) {
            next(error)
        }
    }

    async getOrderById(req, res, next) {
        try{
            const order = await OrderService.getOrderById(req.validateData.params.orderId);

            return res.status(200).json({
                success: true,
                message: "Order fetched successfully.",
                data: order
            })
        } catch (error) {
            next(error);
        }
    }
}


module.exports = new OrderController();