require('./dnsSet');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { env } = require('./config/env');
const { connectSchool, connectCyber } = require('./config/db');
const { startScheduler } = require('./services/schedulerService');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(cors({ origin: env.CORS_ORIGINS.split(','), credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const responseTime = `${Date.now() - start}ms`;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}`);
  });
  next();
});

app.get('/', (req, res) => {
  res.json({
    app: env.APP_NAME,
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    app: env.APP_NAME,
    endpoints: {
      school: `${env.BASE_URL}/api/school`,
      cyber: `${env.BASE_URL}/api/cyber`,
      health: `${env.BASE_URL}/api/health`,
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', require('./routes'));

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectSchool();
    await connectCyber();

    const server = app.listen(env.PORT, () => {
      console.log('');
      console.log('\x1b[36m╔══════════════════════════════════════════╗\x1b[0m');
      console.log(`\x1b[36m║\x1b[0m  \x1b[1m🚀 ${env.APP_NAME}\x1b[0m`);
      console.log(`\x1b[36m║\x1b[0m  \x1b[32m📡 Port:\x1b[0m ${env.PORT}`);
      console.log(`\x1b[36m║\x1b[0m  \x1b[33m🌍 Environment:\x1b[0m ${env.NODE_ENV}`);
      console.log(`\x1b[36m║\x1b[0m  \x1b[34m🏫 School:\x1b[0m ${env.SCHOOL_URL}`);
      console.log(`\x1b[36m║\x1b[0m  \x1b[35m🔐 Cyber:\x1b[0m ${env.CYBER_URL}`);
      console.log(`\x1b[36m║\x1b[0m  \x1b[90m📋 API:\x1b[0m ${env.BASE_URL}/api`);
      console.log('\x1b[36m╚══════════════════════════════════════════╝\x1b[0m');
      console.log('');

      logger.info(`Server started on port ${env.PORT}`);

      if (env.NODE_ENV === 'production') {
        startScheduler();
        logger.info('Schedulers started');
      }
    });

    const gracefulShutdown = async (signal) => {
      logger.warn(`${signal} received. Shutting down...`);
      server.close(() => logger.info('HTTP server closed'));
      try {
        await mongoose.disconnect();
        logger.info('MongoDB disconnected');
      } catch (err) {
        logger.error('MongoDB disconnect error', { error: err.message });
      }
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled rejection', { error: err.message, stack: err.stack?.split('\n').slice(0, 3).join('\n') });
    });
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception', { error: err.message, stack: err.stack?.split('\n').slice(0, 3).join('\n') });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

start();

module.exports = app;