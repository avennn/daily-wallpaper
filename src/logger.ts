import fs from 'fs';
import { fsExistSync } from './file';
import { stdErrorLog, stdOutLog } from './config';

const LogLevelMap = {
    log: 1,
    info: 2,
    warn: 3,
    error: 4,
};

type LogLevel = keyof typeof LogLevelMap;

class Logger {
    logFileReady: boolean;

    constructor() {
        this.logFileReady = false;
        this.init();
    }
    init() {
        this.createLogFile(stdErrorLog);
        this.createLogFile(stdOutLog);
        this.logFileReady = true;
    }
    createLogFile(fPath: string) {
        try {
            const isExist = fsExistSync(fPath);
            if (!isExist) {
                fs.writeFileSync(fPath, '');
            }
        } catch (e) {}
    }
    handleArgs(...args: any[]) {
        return args
            .map((item) => {
                if (typeof item === 'object' && item) {
                    return JSON.stringify(item);
                }
                return String(item);
            })
            .join('');
    }
    baseLog(level: LogLevel, ...args: any[]) {
        console[level](...args);

        if (!this.logFileReady) {
            this.init();
        }

        let logPath = stdOutLog;
        if (LogLevelMap[level] > LogLevelMap['warn']) {
            logPath = stdErrorLog;
        }
        fs.appendFile(logPath, this.handleArgs(...args), (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
    log(...args: any[]) {
        this.baseLog('log', ...args);
    }
    info(...args: any[]) {
        this.baseLog('info', ...args);
    }
    warn(...args: any[]) {
        this.baseLog('warn', ...args);
    }
    error(...args: any[]) {
        this.baseLog('error', ...args);
    }
}

export default new Logger();
