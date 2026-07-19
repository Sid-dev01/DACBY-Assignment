const express = require('express');

const orderRoutes = require('./order.routes');
const schedulerRoutes = require('./scheduler.routes')

const router = express.Router();

router.use('/orders',orderRoutes);
router.use('/scheduler', schedulerRoutes)


module.exports = router;