// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err.stack.red);

  // Handle specific error types
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors.map(e => e.message);
    error = new Error(message);
    error.statusCode = 400;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new Error(message);
    error.statusCode = 401;
  }

  // Handle JWT expired
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new Error(message);
    error.statusCode = 401;
  }

  // Default to 500 server error
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;