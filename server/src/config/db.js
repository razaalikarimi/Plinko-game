const mongoose = require('mongoose');
const pino = require('pino');

const isTest = process.env.NODE_ENV === 'test';

const baseConfig = {
  level: process.env.LOG_LEVEL || 'info'
};

if (!isTest) {
  baseConfig.transport = {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:standard' }
  };
}

const logger = pino(baseConfig);

async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error({ err }, 'MongoDB connection error');
    throw err;
  }
}

module.exports = { connectDB, logger };

