import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { RawOptions } from '../types/index';
import logger from './logger';
import { checkIfDebugMode } from './utils';

export function start(rawOptions: RawOptions & { debug: boolean }) {
    logger.info(
        'Start with input options:\n',
        JSON.stringify(rawOptions, null, 2)
    );
    const isDebug = checkIfDebugMode();
    const startPath = path.join(
        __dirname,
        `./schedule.${isDebug ? 'ts' : 'js'}`
    );
    logger.info('isDebug: ', isDebug);
    logger.info('Schedule file path: ', startPath);
    // exec(`npx ts-node ${startPath}`, (err, stdout, stderr) => {
    //     console.log(err, stdout);
    // });
    const args = isDebug ? ['ts-node', startPath] : [startPath];
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
    const subProcess = spawn(isDebug ? 'npx' : 'node', args, {
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
