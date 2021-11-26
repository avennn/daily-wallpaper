import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import ps from 'ps-node';
import Table from 'cli-table3';
import { RawOptions } from '../types/index';
import logger, { echo } from './logger';
import { checkIfDebugMode, beautifyLog } from './utils';
import { getProcessesInfo, tail, ProcessInfo } from './shell';
import { defaultLogFile, errorLogFile } from './config';

function findRunningTasks(): Promise<ps.Program[]> {
    return new Promise((resolve, reject) => {
        ps.lookup({ command: 'node' }, (err, resultList) => {
            if (err) {
                reject(err);
                return;
            }
            const isDebug = checkIfDebugMode();
            const matchPath = `${
                isDebug ? 'daily-wallpaper' : 'dwp'
            }/dist/src/schedule.js`;
            const runningTasks = resultList.filter((item) => {
                if (item.arguments) {
                    const p = item.arguments[0];
                    if (~p.indexOf(matchPath)) {
                        return true;
                    }
                }
                return false;
            });
            resolve(runningTasks);
        });
    });
}

function psKill(pid: number): Promise<Error | undefined> {
    return new Promise((resolve) => {
        ps.kill(pid, { signal: 'SIGKILL', timeout: 10 }, (err) => {
            resolve(err);
        });
    });
}

async function killTasks(tasks: ps.Program[]): Promise<[null[], Error[]]> {
    const errList: Error[] = [];
    const successList: null[] = [];
    const resList = await Promise.all(tasks.map((t) => psKill(t.pid)));
    resList.forEach((item) => {
        if (item) {
            errList.push(item);
            logger.error('Kill tasks failed!');
        } else {
            successList.push(null);
        }
    });
    return [successList, errList];
}

export async function start(rawOptions: RawOptions) {
    try {
        const tasks = await findRunningTasks();
        if (tasks.length) {
            echo.warn(
                chalk.yellow('You already have running task. Will stop it!')
            );
            const [, errList] = await killTasks(tasks);
            if (errList.length) {
                echo.fail(
                    'Failed!\n',
                    errList,
                    '\nPlease kill process manually and then rerun this command.'
                );
                return;
            }
        }
        logger.info(
            'Start with input options:\n',
            JSON.stringify(rawOptions, null, 2)
        );

        const isDebug = checkIfDebugMode();
        const startPath = path.join(__dirname, './schedule.js');

        logger.info('isDebug: ', isDebug);
        logger.info('Schedule file path: ', startPath);

        const args = [startPath];
        Object.keys(rawOptions).forEach((key) => {
            if (key !== 'debug') {
                const val = rawOptions[key as keyof RawOptions];
                if (typeof val === 'boolean') {
                    args.push(val ? `--${key}` : `--no-${key}`);
                } else {
                    args.push(`--${key}=${val}`);
                }
            }
        });
        const subProcess = spawn('node', args, {
            detached: true,
            stdio: [null, null, null, 'ipc'],
        });
        subProcess.on('message', (data) => {
            const {
                success,
                options,
                originalUrl,
                destPath,
                errorMsg,
                errorStack,
            } = data;
            if (success) {
                echo.success(
                    chalk.green('Download success!'),
                    '\n',
                    `Options: ${JSON.stringify(options, null, 2)}`,
                    '\n',
                    `Picture saved in ${chalk.green(destPath)}`,
                    '\n',
                    `Original url ${chalk.green(originalUrl)}`
                );
            } else {
                echo.fail(
                    chalk.red('Download failed!'),
                    '\n',
                    `Options: ${JSON.stringify(options, null, 2)}`,
                    '\n',
                    chalk.red(errorMsg),
                    '\n',
                    chalk.red(errorStack)
                );
            }
            process.exit(0);
        });
    } catch (e) {
        logger.error('Start error: ', e);
    }
}

export async function stop() {
    try {
        const tasks = await findRunningTasks();
        const total = tasks.length;
        if (!total) {
            echo.warn(chalk.yellow('No running task.'));
            return;
        }
        let count = 0;
        tasks.forEach((task) => {
            ps.kill(task.pid, { signal: 'SIGKILL', timeout: 10 }, (err) => {
                if (err) {
                    echo.fail(`Fail to kill process ${task.pid}`, '\n', err);
                } else {
                    count++;
                    echo.success(`Killed process ${task.pid} `);
                    if (count === total) {
                        echo.success('Stop successfully!');
                    }
                }
            });
        });
    } catch (e) {
        echo.fail(chalk.red('Stop failed!'), '\n', chalk.red(e));
        logger.error('Stop failed!\n', e);
    }
}

export async function list() {
    try {
        const tasks = await findRunningTasks();
        const extraInfos = await getProcessesInfo(
            tasks.map((t) => String(t.pid))
        );
        const table = new Table({
            head: [
                chalk.cyan('PID'),
                chalk.cyan('Uptime'),
                chalk.cyan('Memory'),
                chalk.cyan('CPU%'),
                chalk.cyan('Memory%'),
                chalk.cyan('Options'),
            ],
        });
        tasks.forEach((task) => {
            const { pid, arguments: args } = task;
            const info =
                extraInfos.find((item) => item.pid === String(pid)) ||
                ({} as ProcessInfo);
            table.push([
                pid,
                info.upTime || 'unknown',
                info.memory || 'unknown',
                info.cpuPercent || 'unknown',
                info.memoryPercent || 'unknown',
                args.slice(1).join('\n'),
            ]);
        });
        console.log(table.toString());
    } catch (e) {
        logger.error('List schedule failed!', e);
    }
}

interface LogCommandOptions {
    num: number;
    error: boolean;
}

export async function log(options: LogCommandOptions) {
    try {
        const { num, error } = options;
        const logFile = error ? errorLogFile : defaultLogFile;
        const result = await tail(num, logFile);
        console.log(beautifyLog(result));
    } catch (e) {
        echo.fail('Log failed!', e);
    }
}
