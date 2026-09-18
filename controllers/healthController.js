const mongoose = require("mongoose");

const live = (req, res) => {
    res.status(200).json({ status: "ok" });
};

const ready = (req, res) => {
    const connected = mongoose.connection.readyState === 1;

    if (!connected) {
        return res.status(503).json({
            status: "not ready",
            database: "disconnected"
        });
    }

    res.status(200).json({
        status: "ready",
        database: "connected"
    });
};

module.exports = {live, ready};