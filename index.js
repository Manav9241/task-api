const config = require("./config");
const express = require("express");
const mongoose = require("mongoose");

const taskRoutes = require("./routes/taskRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const SHUTDOWN_TIMEOUT_MS = 5000;
const RETRY_BASE_DELAY_MS = 1000;
const RETRY_MAX_DELAY_MS = 30000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use("/tasks", taskRoutes);

app.use(errorHandler);

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectDB() {
    let attempt = 0;

    while (true) {
        try {
            await mongoose.connect(config.mongodbUri, {
                serverSelectionTimeoutMS: 5000
            });
            console.log("MongoDB connected");
            return;
        } catch (err) {
            attempt++;
            const delay = Math.min(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1), RETRY_MAX_DELAY_MS);
            console.error(`MongoDB connection failed (attempt ${attempt}): ${err.message}`);
            console.log(`Retrying in ${delay / 1000}s`);
            await wait(delay);
        }
    }
}

async function start() {
    await connectDB();
    
    const server = app.listen(config.port, () => {
        console.log(`Server is running on http://localhost:${config.port} (${config.nodeEnv})`);
    });

    process.on("SIGTERM", () => {
        console.log("SIGTERM received, shutting down");

        server.close(async () => {
            await mongoose.connection.close();
            console.log("Server and database connection closed");
            process.exit(0);
        });

        setTimeout(() => {
            console.log("Closing connections still open");
            server.closeAllConnections();
        }, SHUTDOWN_TIMEOUT_MS);
    });
}

start();
