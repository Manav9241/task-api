require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

app.use(express.json());

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        completed: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true}
);

const Task = mongoose.model("Task", taskSchema);

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.get("/tasks", asyncHandler(async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
}));

app.get("/tasks/:id", asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) throw new AppError(404, "Task not found");
    res.json(task);
}));

app.post("/tasks", asyncHandler(async (req, res) => {
    const { title, completed } = req.body ?? {};
    const task = await Task.create({ title, completed: completed ?? false });
    res.status(201).json(task);
}));

app.put("/tasks/:id", asyncHandler(async (req, res) => {
    const { title, completed } = req.body ?? {};

    if (title === undefined) throw new AppError(400, "Title is required");

    const task = await Task.findByIdAndUpdate(
        req.params.id,
        { title, completed: completed ?? false },
        { new: true, runValidators: true }
    );
    
    if (!task) throw new AppError(404, "Task not found");
    res.json(task);
}));

app.patch("/tasks/:id", asyncHandler(async(req, res) => {
    const { title, completed } = req.body ?? {};
    const update = {};
    if (title !== undefined) update.title = title;
    if (completed !== undefined) update.completed = completed;

    const task = await Task.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true, runValidators: true }
    );

    if (!task) throw new AppError(404, "Task not found");
    res.json(task);
}));

app.delete("/tasks/:id", asyncHandler(async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) throw new AppError(404, "Task not found");
    res.status(204).send();
}));

app.use((err, req, res, next) => {
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
});

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
