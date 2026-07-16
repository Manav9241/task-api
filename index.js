const express = require("express");

const app = express();
const PORT = 3000;

const tasks = [
    {
        id: 1,
        title: "Learn Node.js",
        completed: false
    },
    {
        id: 2,
        title: "Learn Express.js",
        completed: false
    },
    {
        id: 3,
        title: "Build the Task API",
        completed: true
    },
];

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});