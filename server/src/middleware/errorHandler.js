const { logger } = require('../config/db');

function notFound(req, res, next) {
  res.status(404).json({ message: 'Not Found' });
  next();
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error({ err }, 'Unhandled error');
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = { notFound, errorHandler };

