require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const taskRoutes = require("./routes/taskRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use("/tasks", taskRoutes);

app.use(errorHandler);

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection failed: ", err.message);
        process.exit(1);
    }
}

async function start() {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

start();
