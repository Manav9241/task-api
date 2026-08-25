const asyncHandler = require("../middleware/asyncHandler");
const Task = require("../models/task");
const AppError = require("../utils/AppError");

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const SORTABLE_FIELDS = ["createdAt", "updatedAt", "title", "completed"];

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toPositiveInt = (value, fallback) => {
    if (typeof value !== "string") return fallback;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1) return fallback;
    return n;
};

exports.getAllTasks = asyncHandler(async(req, res) => {
    const filter = {};

    if (req.query.completed === "true") filter.completed = true;
    if (req.query.completed === "false") filter.completed = false;

    const title = req.query.title;
    if (typeof title === "string" && title.trim() !== "") {
        filter.title = { $regex: escapeRegex(title.trim()), $options: "i" };
    }

    let sort = "-createdAt";
    const requestedSort = req.query.sort;

    if (typeof requestedSort === "string") {
        const field = requestedSort.startsWith("-")
            ? requestedSort.slice(1)
            : requestedSort;

        if (SORTABLE_FIELDS.includes(field)) sort = requestedSort;
    }

    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
        Task.find(filter).sort(`${sort} -_id`).skip(skip).limit(limit),
        Task.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
        data: tasks,
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages
    });
});

exports.getTaskById = asyncHandler(async(req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) throw new AppError(404, "Task not found");
    res.json(task);
});

exports.createTask = asyncHandler(async(req, res) => {
    const { title, completed } = req.body ?? {};
    const task = await Task.create({
        title,
        completed: completed ?? false
    });
    res.status(201).json(task);
});

exports.updateTask = asyncHandler(async(req, res) => {
    const { title, completed } = req.body ?? {};
    
    if (title === undefined) throw new AppError(400, "Title is required");

    const task = await Task.findByIdAndUpdate(
        req.params.id,
        { title, completed: completed ?? false },
        { new: true, runValidators: true }
    );

    if (!task) throw new AppError(404, "Task not found");
    res.json(task);
});

exports.patchTask = asyncHandler(async (req, res) => {
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
});

exports.deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) throw new AppError(404, "Task not found");
    res.status(204).send();
});