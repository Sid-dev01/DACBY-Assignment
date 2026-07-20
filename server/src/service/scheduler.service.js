const mongoose = require("mongoose");
const { ORDER_STATUS } = require("../constants/order.constant")
const { PAGINATION } = require("../constants/pagination.constant")
const OrderRepository = require("../repositories/order.repository")
const SchedulerRepository = require("../repositories/scheduler.repository")
const { SCHEDULER, SCHEDULER_STATUS } = require("../constants/scheduler.constant")
const OrderStatusHistoryRepository = require("../repositories/orderStatusHistory.repository")


class SchedulerService {

    async executeOrderStatusTransition({
        order,
        fromStatus,
        toStatus
    }) {
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            await OrderRepository.updateOrderStatus(order.orderId, toStatus, session);

            await OrderStatusHistoryRepository.create({
                orderId: order.orderId,
                previousStatus: fromStatus,
                currentStatus: toStatus,
                remarks: "Automatically updated by scheduler.",
            }, session);

            await session.commitTransaction();

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async processStatusTransition ({
        fromStatus,
        toStatus,
        olderThanMinutes
    }) {
        const cutOffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);

        const orders = await OrderRepository.findOrdersByStatusOlderThan(fromStatus, cutOffTime);

        let updated = 0;
        let failed = 0;

        for(const order of orders) {
            try{
                await this.executeOrderStatusTransition({
                    order,
                    fromStatus,
                    toStatus,
                })

                updated++;
            } catch (error) {
                failed++;
                console.error(error.message)
            }
        }

        return {
            checked: orders.length,
            updated,
            failed,
        };
    }

    async processOrders() {
        const startedAt = new Date()
        const startTime = Date.now()


        const placedResult = await this.processStatusTransition({
            fromStatus: ORDER_STATUS.PLACED,
            toStatus: ORDER_STATUS.PROCESSING,
            olderThanMinutes: SCHEDULER.PLACED_TO_PROCESSING_MINUTES,
        });

        const processingResult = await this.processStatusTransition({
            fromStatus: ORDER_STATUS.PROCESSING,
            toStatus: ORDER_STATUS.READY_TO_SHIP,
            olderThanMinutes: SCHEDULER.PROCESSING_TO_READY_TO_SHIP_MINUTES,
        });

        const endedAt = new Date();

        const schedulerLog = {
            startedAt,
            endedAt,
            durationInMs: Date.now() - startTime,
            totalOrdersChecked: placedResult.checked + processingResult.checked,
            totalOrdersUpdated: placedResult.updated + processingResult.updated,
            failedOrders: placedResult.failed + processingResult.failed,
            status: placedResult.failed + processingResult.failed > 0
                ? SCHEDULER_STATUS.PARTIAL_SUCCESS : SCHEDULER_STATUS.SUCCESS
        };

        const createdLog = await SchedulerRepository.createSchedulerLog(schedulerLog);

        return createdLog;
    }

    async getSchedulerLogs(query) {
        const page = query.page || PAGINATION.DEFAULT_PAGE;
        const limit = query.limit || PAGINATION.DEFAULT_LIMIT;
        const sortBy = query.sortBy || "createdAt";
        const order = query.order === "asc" ? 1 : -1;

        const filters = {};

        if(query.status) {
            filters.status = query.status;
        }

        return await SchedulerRepository.findSchedulerLogs(filters, {
            page,
            limit,
            sortBy,
            order,
        });
    }
}


module.exports = new SchedulerService();
