# Scheduler Documentation

The scheduler automatically moves orders through fulfillment statuses based on time.

## Purpose

The scheduler is responsible for moving orders from:

```txt
PLACED -> PROCESSING -> READY_TO_SHIP
```

It also writes:

- Scheduler execution logs
- Order status history entries

## Schedule

The cron job is defined in:

```txt
server/src/cron.js
```

It runs every 5 minutes:

```js
cron.schedule("*/5 * * * *", async () => {
    await SchedulerService.processOrders();
});
```

The cron file is loaded in:

```txt
server/src/server.js
```

```js
require('./cron');
```

So the scheduler starts when the backend server starts.

## Transition Rules

The transition timing is defined in:

```txt
server/src/constants/scheduler.constant.js
```

Current rules:

```js
const SCHEDULER = {
    PLACED_TO_PROCESSING_MINUTES: 10,
    PROCESSING_TO_READY_TO_SHIP_MINUTES: 10,
};
```

This means:

- Orders in `PLACED` for at least 10 minutes move to `PROCESSING`.
- Orders in `PROCESSING` for at least 10 minutes move to `READY_TO_SHIP`.

The scheduler checks `updatedAt` to decide whether an order is old enough to transition.

## How It Works

Main service:

```txt
server/src/service/scheduler.service.js
```

Main method:

```js
SchedulerService.processOrders()
```

Flow:

1. Scheduler starts and records `startedAt`.
2. It finds old `PLACED` orders.
3. It transitions them to `PROCESSING`.
4. It finds old `PROCESSING` orders.
5. It transitions them to `READY_TO_SHIP`.
6. Each order transition runs inside a MongoDB transaction.
7. Each successful transition creates an order status history record.
8. Scheduler creates one scheduler log for the run.

## Transaction Usage

Each individual order transition uses a MongoDB session and transaction:

```txt
executeOrderStatusTransition()
```

Inside that transaction, the scheduler:

1. Updates the order status.
2. Creates an order status history entry.
3. Commits the transaction.

If anything fails:

1. The transaction is aborted.
2. The failed count is increased.
3. The scheduler continues processing other orders.

## Order Status History

History records are stored using:

```txt
server/src/models/orderStatusHistory.js
```

Each history entry contains:

- `orderId`
- `previousStatus`
- `currentStatus`
- `changedBy`
- `remarks`
- `createdAt`
- `updatedAt`

For scheduler changes:

```txt
changedBy = Scheduler
remarks = Automatically updated by scheduler.
```

## Scheduler Logs

Scheduler logs are stored using:

```txt
server/src/models/schedulerLog.js
```

Each scheduler log contains:

- `startedAt`
- `endedAt`
- `durationInMs`
- `totalOrdersChecked`
- `totalOrdersUpdated`
- `failedOrders`
- `status`
- `errorMessage`
- `createdAt`
- `updatedAt`

Possible scheduler statuses:

```txt
SUCCESS
FAILED
PARTIAL_SUCCESS
```

Current service behavior:

- `SUCCESS`: no order transitions failed
- `PARTIAL_SUCCESS`: one or more order transitions failed

## Manual Scheduler Run

The scheduler can be triggered manually:

```txt
POST /api/v1/scheduler/process-orders
```

Required header:

```txt
x-scheduler-secret: <SCHEDULER_SECRET>
```

This endpoint is protected because it can update order statuses.

## Viewing Scheduler Logs

Scheduler logs can be fetched with:

```txt
GET /api/v1/scheduler/logs
```

This endpoint is not protected by the scheduler secret because it only reads logs.

The frontend Scheduler page uses this endpoint to show log history.

