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
            trim: true
        },
        completed: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true}
);

const Task = mongoose.model("Task", taskSchema);

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.get("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(task);
    }catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid Task ID" });
        }
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/tasks", async (req, res) => {
    try {
        const { title, completed } = req.body ?? {};
        const task = await Task.create({ title, completed: completed ?? false });
        res.status(201).json(task);
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.put("/tasks/:id", async (req, res) => {
    try {
        const { title, completed } = req.body ?? {};

        if (title === undefined) {
            return res.status(400).json({ message: "Title is required" });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, completed: completed ?? false },
            { new: true, runValidators: true }
        );
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(task);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid Task ID" });
        }
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.patch("/tasks/:id", async(req, res) => {
    try {
        const { title, completed } = req.body ?? {};
        const update = {};
        if (title !== undefined) update.title = title;
        if (completed !== undefined) update.completed = completed;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(task);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid Task ID" });
        }
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.delete("/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(204).send();
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid Task ID" });
        }
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
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
