import path from 'node:path';
import childProcess from 'node:child_process';
import ps from 'ps-node';
import Table from 'cli-table3';
import chalk from 'chalk';
import { findRunningTasks, killTasks, checkIfDebugMode } from '@/utils';
import { echoLogger as echo, logger, printLogFile } from '@/logger';
import type { RawOptions } from '@/types';
import { getProcessesInfo, tail, type ProcessInfo } from '@/shell';
import { defaultLogFile, errorLogFile } from '@/config';

interface LogCommandOptions {
	num: number;
	error: boolean;
}

class DailyWallpaper {
	async stopExistingTasks() {
		const tasks = await findRunningTasks();
		if (tasks.length) {
			echo.warn(chalk.yellow('You already have running tasks. Will stop it!'));
			const [, errList] = await killTasks(tasks);
			if (errList.length) {
				echo.fail('Failed!\n', errList, '\nPlease kill process manually and then rerun this command.');
				return;
			}
		}
	}
	async start(rawOptions: RawOptions): Promise<void> {
		await this.stopExistingTasks();

		logger.info('Start with input options:\n', JSON.stringify(rawOptions, null, 2));

		const isDebug = checkIfDebugMode();
		logger.info('isDebug: ', isDebug);

		const startPath = path.join(__dirname, '../schedule.js');
		logger.info('Schedule file path: ', startPath);

		const args = [startPath];
		for (const key of Object.keys(rawOptions)) {
			if (key !== 'debug') {
				const val = rawOptions[key as keyof RawOptions];
				if (typeof val === 'boolean') {
					args.push(val ? `--${key}` : `--no-${key}`);
				} else {
					args.push(`--${key}=${val}`);
				}
			}
		}

		const subProcess = childProcess.spawn('node', args, {
			detached: true,
			stdio: [null, null, null, 'ipc'],
		});

		subProcess.on('message', (data) => {
			// @ts-ignore
			const { success, options, originalUrl, destPath, errorMsg, errorStack } = data;
			if (success) {
				echo.success(
					chalk.green('Download success!'),
					'\n',
					`Options: ${JSON.stringify(options, null, 2)}`,
					'\n',
					`Picture saved in ${chalk.green(destPath)}`,
					'\n',
					`Original url ${chalk.green(originalUrl)}`,
				);
			} else {
				echo.fail(
					chalk.red('Download failed!'),
					'\n',
					`Options: ${JSON.stringify(options, null, 2)}`,
					'\n',
					chalk.red(errorMsg),
					'\n',
					chalk.red(errorStack),
				);
			}
			process.exit(0);
		});
	}

	async stop() {
		try {
			const tasks = await findRunningTasks();
			const total = tasks.length;

			if (!total) {
				echo.warn(chalk.yellow('No running task.'));
				return;
			}

			let count = 0;
			for (const task of tasks) {
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
			}
		} catch (e) {
			echo.fail(chalk.red('Stop failed!'), '\n', chalk.red(e));
			logger.error('Stop failed!\n', e);
		}
	}

	async list(): Promise<void> {
		try {
			const tasks = await findRunningTasks();
			const extraInfos = await getProcessesInfo(tasks.map((t) => String(t.pid)));
			const table = new Table({
				chars: {
					top: chalk.white('─'),
					'top-mid': chalk.white('┬'),
					'top-left': chalk.white('┌'),
					'top-right': chalk.white('┐'),
					bottom: chalk.white('─'),
					'bottom-mid': chalk.white('┴'),
					'bottom-left': chalk.white('└'),
					'bottom-right': chalk.white('┘'),
					left: chalk.white('│'),
					'left-mid': chalk.white('├'),
					mid: chalk.white('─'),
					'mid-mid': chalk.white('┼'),
					right: chalk.white('│'),
					'right-mid': chalk.white('┤'),
					middle: chalk.white('│'),
				},
				head: [
					chalk.cyan('PID'),
					chalk.cyan('Uptime'),
					chalk.cyan('Memory'),
					chalk.cyan('CPU%'),
					chalk.cyan('Memory%'),
					chalk.cyan('Options'),
				],
			});
			for (const task of tasks) {
				const { pid, arguments: args } = task;
				const info = extraInfos.find((item) => item.pid === String(pid)) || ({} as ProcessInfo);
				table.push([
					pid,
					info.upTime || 'unknown',
					info.memory || 'unknown',
					info.cpuPercent || 'unknown',
					info.memoryPercent || 'unknown',
					args.slice(1).join('\n'),
				]);
			}
			console.log(table.toString());
		} catch (e) {
			logger.error('List schedule failed!', e);
		}
	}

	async log(options: LogCommandOptions) {
		try {
			const { num, error } = options;
			const logFile = error ? errorLogFile : defaultLogFile;
			const result = await tail(num, logFile);
			printLogFile(result);
		} catch (e) {
			echo.fail('Log failed!', e);
		}
	}
}

export default DailyWallpaper;
