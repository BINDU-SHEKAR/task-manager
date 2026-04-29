const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, async (req, res) => {
  const task = new Task({
    userId: req.user.id,
    title: req.body.title,
    dueDate: req.body.dueDate || null
  });

  await task.save();
  res.json(task);
});

router.get("/", auth, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id });
  res.json(tasks);
});

router.put("/:id", auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(task);
});

router.delete("/:id", auth, async (req, res) => {
  await Task.deleteOne({
    _id: req.params.id,
    userId: req.user.id
  });

  res.json({ message: "Task deleted" });
});

module.exports = router;