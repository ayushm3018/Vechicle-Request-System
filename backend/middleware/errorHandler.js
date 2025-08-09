export const errorHandler = (error, req, res, next) => {
  console.error('Error occurred:', error);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  } else if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message = 'Duplicate entry. Record already exists.';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced record not found.';
  } else if (error.message) {
    message = error.message;
  }

  res.status(statusCode).json({
    error: true,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};