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

const tasks = [
    {id: 1, title: "Learn Node.js", completed: false},
    {id: 2, title: "Learn Express.js", completed: false},
    {id: 3, title: "Build the Task API", completed: true}
];

let nextId = tasks.length + 1;

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.get("/tasks", (req, res) => {
    res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(task);
});

app.post("/tasks", (req, res) => {
    if (!req.body.title) {
        return res.status(400).json({ message: "Title is required" });
    }

    const newTask =  {
        id: nextId++,
        title: req.body.title,
        completed: req.body.completed ?? false
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

app.put("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);
    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found" });
    }

    if(!req.body.title) {
        return res.status(400).json({ message: "Title is required" });
    }

    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title: req.body.title,
        completed: req.body.completed ?? false
    };

    res.json(tasks[taskIndex]);
});

app.patch("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }
    
    if (req.body.title !== undefined) {
        task.title = req.body.title;
    }

    if (req.body.completed !== undefined) {
        task.completed = req.body.completed;
    }

    res.json(task);
});

app.delete("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);
    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found" });
    }

    tasks.splice(taskIndex, 1);
    res.status(204).send();
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
    
    const tasksInDb = await Task.find();
    console.log("Tasks in DB: ", tasksInDb);

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

start();
