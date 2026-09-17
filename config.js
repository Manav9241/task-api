require("dotenv").config();

const errors = [];

const port = process.env.PORT === undefined ? 3000 : Number(process.env.PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(`PORT must be a whole number from 1 to 65535, got "${process.env.PORT}"`);
}

const mongodbUri = process.env.MONGODB_URI;
if (!mongodbUri) {
    errors.push("MONGODB_URI is required but not set");
}

if (errors.length > 0) {
    console.error("Invalid configuration:");
    errors.forEach((message) => console.error(` - ${message}`));
    process.exit(1);
}

const config = {
    port,
    nodeEnv: process.env.NODE_ENV || "development",
    mongodbUri
};

module.exports = config;