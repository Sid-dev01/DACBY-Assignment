const crypto = require('crypto');

const generateOrderId = () => {
    const date = new Date().toISOString().slice(0,10).replace(/-/g, '');

    const uniqueId = crypto.randomUUID().split("-")[0].toUpperCase();

    return `ORD-${date}-${uniqueId}`;
}

module.exports = generateOrderId;