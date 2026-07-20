const DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

const getAllowedOrigins = () => {
    const envOrigins = (process.env.CORS_ORIGIN || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    return [
        ...new Set([
            ...DEFAULT_ALLOWED_ORIGINS,
            ...envOrigins,
        ]),
    ];
};

const corsMiddleware = (req, res, next) => {
    const requestOrigin = req.headers.origin;
    const allowedOrigins = getAllowedOrigins();
    const allowsAllOrigins = allowedOrigins.includes("*");

    if(requestOrigin && (allowsAllOrigins || allowedOrigins.includes(requestOrigin))) {
        res.setHeader("Access-Control-Allow-Origin", allowsAllOrigins ? "*" : requestOrigin);
        res.setHeader("Vary", "Origin");
    }

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization,x-scheduler-secret"
    );

    if(req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
};

module.exports = corsMiddleware;
