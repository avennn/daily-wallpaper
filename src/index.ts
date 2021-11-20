import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import shell from 'shelljs';
import ps from 'ps-node';
import { RawOptions } from '../types/index';
import logger from './logger';
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
        // success: 2705, fail: 274c
        if (success) {
            console.log(
                '\u2705',
                chalk.green('Download success!'),
                '\n',
                `Options: ${JSON.stringify(options, null, 2)}`,
                '\n',
                `Picture saved in ${chalk.green(destPath)}`,
                '\n',
                `Original url ${chalk.green(originalUrl)}`
            );
        } else {
            console.log(
                '\u274c',
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
        const size = tasks.length;
        if (!size) {
            console.log('no runing tasks');
            return;
        }
        let count = 0;
        tasks.forEach((task) => {
            ps.kill(task.pid, { signal: 'SIGKILL', timeout: 10 }, (err) => {
                if (err) {
                    console.log('kill fail', chalk.red(err));
                } else {
                    count++;
                    if (count === tasks.length) {
                        console.log(chalk.green('Stop successfully!'));
                    }
                }
            });
        });
    } catch (e) {
        console.log('\u274c', chalk.red('Stop failed!'), '\n', chalk.red(e));
        logger.error('Stop failed!\n', e);
    }
}
