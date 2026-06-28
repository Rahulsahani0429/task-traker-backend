/**
 * Task Controller
 * Handles all CRUD operations for tasks following MVC pattern
 */
const Task = require('../models/Task');
const { validationResult } = require('express-validator');
const { formatValidationErrors, asyncHandler } = require('../utils/helpers');

/**
 * @desc    Get all tasks with optional filtering, sorting, and searching
 * @route   GET /api/tasks
 * @access  Public
 */
const getAllTasks = asyncHandler(async (req, res) => {
  const { status, priority, search, sort, page = 1, limit = 50 } = req.query;

  // Build filter object
  console.log(req.query, "--------------------------------")
  const filter = {};

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (priority && priority !== 'All') {
    filter.priority = priority;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort object
  let sortObj = { createdAt: -1 }; // Default: newest first

  switch (sort) {
    case 'oldest':
      sortObj = { createdAt: 1 };
      break;
    case 'dueDate':
      sortObj = { dueDate: 1 };
      break;
    case 'priority':
      // High > Medium > Low
      sortObj = { priority: -1 };
      break;
    case 'newest':
    default:
      sortObj = { createdAt: -1 };
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
    Task.countDocuments(filter),
  ]);

  // Statistics for dashboard
  const [stats] = await Promise.all([
    Task.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] },
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  const statistics = stats[0] || {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    highPriority: 0,
  };

  res.status(200).json({
    success: true,
    count: tasks.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    statistics,
    data: tasks,
  });
});

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Public
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Public
 */
const createTask = asyncHandler(async (req, res) => {
  // Check express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formatValidationErrors(errors.array()),
    });
  }

  const { title, description, status, priority, dueDate } = req.body;
  console.log(req.body)


  const task = await Task.create({
    title,
    description,
    status: status || 'Pending',
    priority: priority || 'Medium',
    dueDate,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

/**
 * @desc    Update a task by ID
 * @route   PUT /api/tasks/:id
 * @access  Public
 */
const updateTask = asyncHandler(async (req, res) => {
  // Check express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formatValidationErrors(errors.array()),
    });
  }

  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  const { title, description, status, priority, dueDate } = req.body;

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    { title, description, status, priority, dueDate },
    {
      new: true,        // Return updated document
      runValidators: true, // Run schema validators
    }
  );

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: updatedTask,
  });
});

/**
 * @desc    Delete a task by ID
 * @route   DELETE /api/tasks/:id
 * @access  Public
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  await Task.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: { id: req.params.id },
  });
});

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
