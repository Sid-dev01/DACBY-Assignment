const Order = require('../models/orders')

class OrderRepository {

    async createOrder(orderData) {
        return await Order.create(orderData);
    }

    async findByOrderId(orderId) {
        return await Order.findOne({ orderId });
    }

    async find(filters = {}) {
        return await Order.find(filters).sort({ createdAt: -1 });
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