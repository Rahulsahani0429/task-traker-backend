/**
 * Utility Helper Functions
 * Reusable utilities for the backend application
 */

/**
 * Async handler wrapper to avoid try-catch boilerplate in controllers
 * @param {Function} fn - Async controller function
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Format express-validator errors into a clean object
 * @param {Array} errors - Array of validation error objects
 * @returns {Object} - Field-keyed error messages
 */
const formatValidationErrors = (errors) => {
  return errors.reduce((acc, error) => {
    acc[error.path] = error.msg;
    return acc;
  }, {});
};

/**
 * Format date to a readable string
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Sanitize string to prevent XSS
 * @param {string} str - Input string
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

module.exports = {
  asyncHandler,
  formatValidationErrors,
  formatDate,
  sanitizeString,
};
