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

    async updateByOrderId(orderId, updateData) {
        return await Order.findOneAndUpdate({ orderId }, updateData,{
            new: true,
            runValidators: true,
        });
    }
    
    async deleteByorderId(orderId) {
        return await Order.findOneAndDelete({ orderId });
    }

}

module.exports = new OrderRepository();