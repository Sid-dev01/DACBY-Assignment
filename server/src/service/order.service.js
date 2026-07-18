const AppError = require('../utils/appError');
const generateOrderId = require('../utils/generateOrderId');
const OrderRepository = require('../repositories/order.repository');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants/order.constant');


class OrderService {
    async createOrder(orderData) {
        const MAX_RETRIES = 5;

        for(let attempt =1; attempt <= MAX_RETRIES; attempt++) {
            try{

                const totalAmount = orderData.items.reduce(
                    (total, item) => total + item.quantity * item.price,
                    0
                );
                const order = {
                    ...orderData,
                    orderId: generateOrderId(),
                    amount: totalAmount,
                    orderStatus: orderData.orderStatus,
                    paymentStatus: orderData.paymentStatus,
                };

                return await OrderRepository.createOrder(order);
            } catch (error) {
                if(error.code === 11000 && attempt < MAX_RETRIES) {
                    continue;
                }

                throw error;
            }
        }

        throw new AppError('Failed to create order after multiple attempts', 500);
    }
}

module.exports = new OrderService();