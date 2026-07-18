const validateRequest = (schema) => {
    return (req, res, next) => {
        console.log("Request body", req.body);
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if(!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.flatten(),
            });
        }

        req.validateData = result.data;

        next();
    }
};

module.exports = validateRequest;