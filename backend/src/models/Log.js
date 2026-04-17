const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
        route: String,
        method: String,
        configName: String,
        externalApiUrl: String,
        requestBody: mongoose.Schema.Types.Mixed,
        responseBody: mongoose.Schema.Types.Mixed,
        statusCode: Number,
        userAgent: String,
        ip: String,
        username: String,
        error: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model('Log', logSchema);
