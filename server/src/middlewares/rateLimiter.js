const rateLimit = require('express-rate-limit');


const rateLimiter = (windowInMinutes, maxRequests) => {
    return rateLimit({
        windowMs: windowInMinutes * 60 * 1000,
        max : maxRequests,
        standardHeaders: true,
        legacyHeaders: false,

        message: {
            success: false,
            message: "Too many requests, please try again later."
        },
    });
};

module.exports = rateLimiter;