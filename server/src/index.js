require('dotenv').config();
const http = require('http');

const app = require('./app');
const { connectDB, logger } = require('./config/db');

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
    const server = http.createServer(app);

    server.listen(PORT, HOST, () => {
      logger.info(`Server listening on http://${HOST}:${PORT}`);
    });

    process.on('SIGINT', () => shutdown(server));
    process.on('SIGTERM', () => shutdown(server));
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

function shutdown(server) {
  logger.info('Shutting down...');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
}

start();

