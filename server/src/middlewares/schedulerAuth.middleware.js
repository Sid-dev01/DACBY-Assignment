const AppError = require("../utils/appError");

const schedulerAuth = (req, res, next) => {

    const secret = req.headers["x-scheduler-secret"];

    if(!secret || secret !== process.env.SCHEDULER_SECRET) {
        return next(
            new AppError(
                "Unauthorized scheduler request",
                401
            )
        )
    }

    next();
}


module.exports = schedulerAuth;