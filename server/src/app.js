const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');

const { logger } = require('./config/db');
const roundRoutes = require('./routes/roundRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200
});

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174'
      ];
      
      // Add CLIENT_ORIGIN if it's set
      if (process.env.CLIENT_ORIGIN) {
        allowedOrigins.push(process.env.CLIENT_ORIGIN);
      }
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (!process.env.CLIENT_ORIGIN) {
        // If no CLIENT_ORIGIN is set, allow all origins (development)
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '1mb' }));
app.use(
  pinoHttp({
    logger
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/rounds', roundRoutes);
app.use('/api/verify', verifyRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

