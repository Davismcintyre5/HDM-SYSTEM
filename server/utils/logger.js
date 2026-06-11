// utils/logger.js

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const currentLevel = levels[process.env.LOG_LEVEL] || (process.env.NODE_ENV === 'production' ? levels.info : levels.debug);

const formatDate = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

const maskSensitive = (obj) => {
  if (!obj) return obj;
  const masked = { ...obj };
  if (masked.password) masked.password = '***';
  if (masked.newPassword) masked.newPassword = '***';
  if (masked.currentPassword) masked.currentPassword = '***';
  if (masked.oldPassword) masked.oldPassword = '***';
  return masked;
};

const writeToFile = (level, message, meta) => {
  const date = new Date().toISOString().slice(0, 10);
  const filepath = path.join(LOG_DIR, `${date}.log`);
  const line = `[${formatDate()}] [${level.toUpperCase()}] ${message} ${meta ? JSON.stringify(meta) : ''}\n`;
  fs.appendFile(filepath, line, (err) => { if (err) console.error('Log write error:', err); });
};

const log = (level, message, meta) => {
  if (levels[level] > currentLevel) return;

  const timestamp = formatDate();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';

  if (level === 'error') {
    console.error(`\x1b[31m[${timestamp}] [ERROR]\x1b[0m ${message}${metaStr}`);
  } else if (level === 'warn') {
    console.warn(`\x1b[33m[${timestamp}] [WARN]\x1b[0m ${message}${metaStr}`);
  } else if (level === 'info') {
    console.log(`\x1b[36m[${timestamp}] [INFO]\x1b[0m ${message}${metaStr}`);
  } else if (level === 'http') {
    const [method, url, statusCode, responseTime] = message.split(' ');
    let statusColor;
    const code = parseInt(statusCode);
    if (code >= 500) statusColor = '\x1b[31m';
    else if (code >= 400) statusColor = '\x1b[33m';
    else if (code >= 300) statusColor = '\x1b[36m';
    else if (code >= 200) statusColor = '\x1b[32m';
    else statusColor = '\x1b[0m';

    let methodColor;
    switch (method) {
      case 'GET': methodColor = '\x1b[32m'; break;
      case 'POST': methodColor = '\x1b[34m'; break;
      case 'PUT': methodColor = '\x1b[33m'; break;
      case 'PATCH': methodColor = '\x1b[35m'; break;
      case 'DELETE': methodColor = '\x1b[31m'; break;
      default: methodColor = '\x1b[0m';
    }

    console.log(`\x1b[90m[${timestamp}]\x1b[0m ${methodColor}${method}\x1b[0m ${url} ${statusColor}${statusCode}\x1b[0m ${responseTime ? `\x1b[90m${responseTime}\x1b[0m` : ''}`);
  } else if (level === 'debug') {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[90m[${timestamp}] [DEBUG]\x1b[0m ${message}${metaStr}`);
    }
  }

  writeToFile(level, message, meta);
};

const logger = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  http: (message, meta) => log('http', message, meta),
  debug: (message, meta) => log('debug', message, meta),
};

// Cleanup old logs (keep last 30 days)
const cleanupOldLogs = () => {
  const files = fs.readdirSync(LOG_DIR);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  files.forEach(file => {
    const match = file.match(/^(\d{4}-\d{2}-\d{2})\.log$/);
    if (match) {
      const fileDate = new Date(match[1]);
      if (fileDate < cutoff) {
        fs.unlinkSync(path.join(LOG_DIR, file));
        console.log(`🧹 Cleaned old log: ${file}`);
      }
    }
  });
};

// Run cleanup weekly
setInterval(cleanupOldLogs, 7 * 24 * 60 * 60 * 1000);
cleanupOldLogs();

module.exports = logger;