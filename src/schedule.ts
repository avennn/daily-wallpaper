import { ToadScheduler, Task, SimpleIntervalJob, SimpleIntervalSchedule } from 'toad-scheduler';
import { getInfo } from 'nc-screen';
import { Command } from 'commander';
// import fs from 'fs';
// import dayjs from 'dayjs';

// import { saveHistoryConfig } from './history';
// import { setAutoStartup } from './plist';
import { downloadPicture } from './picture';
import { parseInterval } from './utils';
import { defaultStartOptions } from './config';
import { createOptionArgs } from './command';
import type { RawOptions, FinalOptions } from './types';
import { logger } from './logger';

function runLeadingSchedule(fn: () => void, interval: SimpleIntervalSchedule): ToadScheduler {
	fn();
	const scheduler = new ToadScheduler();

	const task = new Task('dwp', fn);
	const job = new SimpleIntervalJob(interval, task);

	scheduler.addSimpleIntervalJob(job);

	return scheduler;
}

function mergeOptions(rawOptions: RawOptions): FinalOptions {
	const { width, height } = getInfo();
	const finalOptions = {
		width,
		height,
		...defaultStartOptions,
		...rawOptions,
	};
	if (typeof finalOptions.max !== 'number' || finalOptions.max === 0) {
		finalOptions.max = defaultStartOptions.max;
	}
	return finalOptions;
}

export function run(): ToadScheduler {
	const program = new Command();
	program
		.option(...(createOptionArgs('width') as [string]))
		.option(...(createOptionArgs('height') as [string]))
		.option(...(createOptionArgs('interval') as [string]))
		.option(...(createOptionArgs('max') as [string]))
		.option(...(createOptionArgs('startup') as [string]))
		.option(...(createOptionArgs('no-startup') as [string]));
	program.parse();
	const rawOptions = program.opts() as RawOptions;
	const options = mergeOptions(rawOptions);

	logger.info('Options: ', JSON.stringify(options, null, 2));

	const { width, height, max, startup, interval } = options;
	let inited = false;

	// saveHistoryConfig({ width, height, max, interval });
	// setAutoStartup(startup);
	return runLeadingSchedule(async () => {
		// fs.writeFileSync(
		//     './log',
		//     dayjs().format('YYYY-MM-DD HH:mm:ss') + '\n',
		//     { flag: 'a' }
		// );
		const { success, data, errorMsg, errorStack } = await downloadPicture({
			width,
			height,
			max,
		});
		if (!inited) {
			try {
				process.send?.(
					success
						? {
								success,
								options,
								destPath: data?.destPath,
								originalUrl: data?.originalUrl,
							}
						: {
								success,
								options,
								errorMsg,
								errorStack,
							},
				);
			} catch (e) {
				logger.error('Failed to send message to main thread: ', e);
			} finally {
				inited = true;
			}
		}
	}, parseInterval(interval));
}

run();
