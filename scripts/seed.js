require("dotenv").config();
const mongoose = require("mongoose");
const Task = require("../models/task");

const COUNT = Number(process.argv[2]) || 15;

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const removed = await Task.deleteMany({ title: /^Seed task/ });
    console.log(`removed ${removed.deletedCount} existing seed task(s)`);

    const docs = Array.from({ length: COUNT }, (_, i) => ({
        title: `Seed task ${String(i + 1).padStart(2, "0")}`,
        completed: i % 3 === 0
    }));

    const inserted = await Task.insertMany(docs);
    console.log(`inserted ${inserted.length} seed task(s)`);
};

run()
    .catch((err) => {
        console.error("Seed failed:", err.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());