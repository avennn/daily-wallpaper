/**
 * 日志同时输出到控制台和文件
 */
import log4js from 'log4js';
import { defaultLogFile, errorLogFile } from '../config';

log4js.configure({
  appenders: {
    console: { type: 'console' },
    app: {
      type: 'file',
      filename: defaultLogFile,
      maxLogSize: 5 * 1024 * 1024 /* 5MB */,
      backups: 5,
    },
    appError: {
      type: 'file',
      filename: errorLogFile,
      maxLogSize: 5 * 1024 * 1024 /* 5MB */,
      backups: 5,
    },
    errorFilter: {
      type: 'logLevelFilter',
      appender: 'appError',
      level: 'error',
    },
  },
  categories: {
    default: { appenders: ['console'], level: 'debug' },
    dwp: { appenders: ['app', 'errorFilter'], level: 'info' },
  },
});

const logger = log4js.getLogger('dwp');

export default logger;
