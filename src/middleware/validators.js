/**
 * Request Validators Middleware
 * Uses express-validator for robust input validation
 */
const { body } = require('express-validator');

/**
 * Shared validation rules for task title
 */
const titleValidation = body('title')
  .notEmpty()
  .withMessage('Title is required')
  .isLength({ min: 3 })
  .withMessage('Title must be at least 3 characters long')
  .isLength({ max: 100 })
  .withMessage('Title cannot exceed 100 characters')
  .trim();

/**
 * Shared validation rules for task description
 */
const descriptionValidation = body('description')
  .optional({ nullable: true, checkFalsy: true })
  .isLength({ max: 500 })
  .withMessage('Description cannot exceed 500 characters')
  .trim();

/**
 * Shared validation rules for task status
 */
const statusValidation = body('status')
  .optional()
  .isIn(['Pending', 'In Progress', 'Completed'])
  .withMessage('Status must be one of: Pending, In Progress, Completed');

/**
 * Shared validation rules for task priority
 */
const priorityValidation = body('priority')
  .optional()
  .isIn(['Low', 'Medium', 'High'])
  .withMessage('Priority must be one of: Low, Medium, High');

/**
 * Shared validation rules for due date
 */
const dueDateValidation = body('dueDate')
  .notEmpty()
  .withMessage('Due date is required')
  .isISO8601()
  .withMessage('Due date must be a valid date')
  .toDate();

/**
 * Validation chain for creating a task
 */
const validateCreateTask = [
  titleValidation,
  descriptionValidation,
  statusValidation,
  priorityValidation,
  dueDateValidation,
];

/**
 * Validation chain for updating a task
 */
const validateUpdateTask = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .trim(),
  descriptionValidation,
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be one of: Pending, In Progress, Completed'),
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be one of: Low, Medium, High'),
  dueDateValidation,
];

module.exports = { validateCreateTask, validateUpdateTask };
