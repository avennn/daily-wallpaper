import path from 'path';
import log4js from 'log4js';
import { logDir } from './config';

type EchoIconKey = 'success' | 'fail' | 'warn';
const echoIcons: Record<EchoIconKey, string> = {
    success: '\u2705',
    fail: '\u274c',
    warn: '\u26a1',
};
export const echo = {} as Record<EchoIconKey, (...args: any[]) => void>;
(['success', 'fail', 'warn'] as EchoIconKey[]).forEach((status) => {
    echo[status] = function (...args: any[]) {
        console.log(echoIcons[status], ...args);
    };
});

log4js.configure({
    appenders: {
        console: { type: 'console' },
        app: {
            type: 'file',
            filename: path.join(logDir, 'dwp.log'),
            maxLogSize: 5 * 1024 * 1024 /* 5MB */,
            backups: 5,
        },
    },
    categories: {
        default: { appenders: ['console'], level: 'debug' },
        dwp: { appenders: ['app'], level: 'info' },
    },
});

const logger = log4js.getLogger('dwp');

export default logger;
