const errorHandler = (err, req, res, next) => {

    // Duplicate Key Error
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Resource already exists.",
        });
    }

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors: Object.values(err.errors).map(
                (error) => error.message
            ),
        });
    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid resource identifier.",
        });
    }

    // Our Custom AppError
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    // Unexpected Errors
    console.error(err);

    return res.status(500).json({
        success: false,
        message: "Internal Server Error.",
    });
};

module.exports = errorHandler;