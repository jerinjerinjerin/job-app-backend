import path from 'path';

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = path.resolve(__dirname, '../../../../logs');

const isDev = process.env.NODE_ENV !== 'production';

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    level: isDev ? 'debug' : 'info',
  }),
  new DailyRotateFile({
    filename: path.join(logDir, 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true,
    level: 'info',
  }),
  new DailyRotateFile({
    filename: path.join(logDir, 'errors-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true,
    level: 'error',
  }),
];

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: customFormat,
  transports,
  exitOnError: false,
});

export default logger;
