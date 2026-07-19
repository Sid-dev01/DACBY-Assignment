const Order = require('../models/orders')

class OrderRepository {

    async createOrder(orderData) {
        return await Order.create(orderData);
    }

    async findByOrderId(orderId) {
        return await Order.findOne({ orderId });
    }

    async find(filters = {}, options = {}) {
        const { page, limit, sortBy, order } = options;

        const skip = (page - 1) * limit;

        const [ orders, total ] = await Promise.all([
            Order.find(filters)
            .sort({ [sortBy]: order})
            .skip(skip)
            .limit(limit),

            Order.countDocuments(filters),
        ]);

        return {
            orders,
            total,
        };
    }

    async findOrdersByStatusOlderThan(status, cutOffTime) {
        return await Order.find({
            orderStatus:status,
            updatedAt: { $lte: cutOffTime },
        });
    }

    async updateOrderStatus(orderId, orderStatus, session) {
        return await Order.findOneAndUpdate({orderId}, {
            $set: {
                orderStatus,
            },
        },
        {
            returnDocument: "after",
            session,
        })
    }

}

module.exports = new OrderRepository();