import log4js from 'log4js';
import { defaultLogFile, errorLogFile } from './config';

type EchoIconKey = 'success' | 'fail' | 'warn' | 'normal';
const echoIcons: Record<EchoIconKey, string> = {
    success: '\u2705',
    fail: '\u274c',
    warn: '💡',
    normal: '\u2728',
};
export const echo = {} as Record<EchoIconKey, (...args: any[]) => void>;
(['success', 'fail', 'warn', 'normal'] as EchoIconKey[]).forEach((status) => {
    echo[status] = function (...args: any[]) {
        console.log(echoIcons[status], ...args);
    };
});

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
            level: 'error',
        },
    },
    categories: {
        default: { appenders: ['console'], level: 'debug' },
        dwp: { appenders: ['app', 'appError'], level: 'info' },
    },
});

const logger = log4js.getLogger('dwp');

export default logger;
