import { spawn } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import { RawOptions } from '../../types/index';
import { checkIfDebugMode } from '../utils';
import { logger, echoLogger as echo } from '@/logger';
import { findRunningTasks, killTasks } from '../utils';

export default async function start(rawOptions: RawOptions): Promise<void> {
  try {
    const tasks = await findRunningTasks();
    if (tasks.length) {
      echo.warn(chalk.yellow('You already have running tasks. Will stop it!'));
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
    const startPath = path.join(__dirname, '../schedule.js');

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
      const { success, options, originalUrl, destPath, errorMsg, errorStack } =
        data;
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
