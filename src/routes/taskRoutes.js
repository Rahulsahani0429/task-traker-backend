/**
 * Task Routes
 * Defines all API endpoints for task operations
 */
const express = require('express');
const router = express.Router();

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const {
  validateCreateTask,
  validateUpdateTask,
} = require('../middleware/validators');

// Task routes
router.route('/')
  .get(getAllTasks)           // GET  /api/tasks
  .post(validateCreateTask, createTask); // POST /api/tasks

router.route('/:id')
  .get(getTaskById)                        // GET    /api/tasks/:id
  .put(validateUpdateTask, updateTask)     // PUT    /api/tasks/:id
  .delete(deleteTask);                     // DELETE /api/tasks/:id

module.exports = router;
