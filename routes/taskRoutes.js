const express = require("express");

const router = express.Router();

const { getAllTasks, createTask, getTaskById, updateTask, patchTask, deleteTask } = require("../controllers/taskController");

router.route("/")
    .get(getAllTasks)
    .post(createTask);

router.route("/:id")
    .get(getTaskById)
    .put(updateTask)
    .patch(patchTask)
    .delete(deleteTask);

module.exports = router;