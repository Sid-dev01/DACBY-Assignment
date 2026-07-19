const errorHandler = (err, req, res, next) => {

    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Resource already exists.",
        });
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors: Object.values(err.errors).map(
                (error) => error.message
            ),
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid resource identifier.",
        });
    }

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    console.error(err);

    return res.status(500).json({
        success: false,
        message: "Internal Server Error.",
    });
};

module.exports = errorHandler;