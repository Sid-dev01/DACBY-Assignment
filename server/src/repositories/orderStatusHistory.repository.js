const OrderStatusHistory = require("../models/orderStatusHistory");


class OrderStatusHistoryRepository {
    async create(historyData, session) {
        return await OrderStatusHistory.create([historyData], { session });
    }
}

module.exports = new OrderStatusHistoryRepository();