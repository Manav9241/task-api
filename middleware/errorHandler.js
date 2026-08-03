const errorHandler = (err, req, res, next) => {
    if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid Task Id" });
    }
    if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Server Error" });
};

module.exports = errorHandler;