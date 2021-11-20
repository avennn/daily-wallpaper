import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import ps from 'ps-node';
import { RawOptions } from '../types/index';
import logger, { echo } from './logger';
import { checkIfDebugMode } from './utils';

function findRunningTasks(): Promise<ps.Program[]> {
    return new Promise((resolve, reject) => {
        ps.lookup({ command: 'node', ppid: 1 }, (err, resultList) => {
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

export function start(rawOptions: RawOptions & { debug: boolean }) {
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
                    echo.success(`Stop process ${task.pid} `);
                    if (count === total) {
                        echo.success('Stop all successfully!');
                    }
                }
            });
        });
    } catch (e) {
        echo.fail(chalk.red('Stop failed!'), '\n', chalk.red(e));
        logger.error('Stop failed!\n', e);
    }
}
