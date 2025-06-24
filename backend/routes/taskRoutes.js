const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// Show all tasks
router.get('/', isLoggedIn, async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.session.user._id });

  // Add color property based on priority
  const tasksWithColor = tasks.map(task => {
    let color = 'green';
    if (task.priority === 'high') color = 'red';
    else if (task.priority === 'medium') color = 'orange';

    return { ...task.toObject(), color };
  });

  res.render('tasks/index', { tasks: tasksWithColor });
});

// New Task Form
router.get('/new', isLoggedIn, (req, res) => {
  res.render('tasks/new');
});

// Create Task
router.post('/', isLoggedIn, async (req, res) => {
  const task = new Task(req.body);
  task.assignedTo = req.session.user._id;
  await task.save();
  res.redirect('/tasks');
});

// View Task Details
router.get('/:id', isLoggedIn, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.redirect('/tasks');
  res.render('tasks/show', { task });
});

// Edit Task Form
router.get('/:id/edit', isLoggedIn, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.redirect('/tasks');
  res.render('tasks/edit', { task });
});

// Update Task
router.put('/:id', isLoggedIn, async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/tasks');
});

// Delete Task
router.delete('/:id', isLoggedIn, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect('/tasks');
});

// Update Task Status
router.post('/:id/status', isLoggedIn, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'completed'];
  if (!validStatuses.includes(status)) return res.redirect('/tasks');

  await Task.findByIdAndUpdate(req.params.id, { status });
  res.redirect('/tasks');
});

module.exports = router;
