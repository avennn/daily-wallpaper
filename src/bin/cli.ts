#!/usr/bin/env node

import { Command } from 'commander';
import { getAppVersion, parseArgv2Integer, parseArgv2Interval } from '@/utils';
import { DEFAULT_START_OPTIONS, DEFAULT_LOG_LINES_COUNT } from '@/config';
import DailyWallpaper from '@/client';

async function run() {
	try {
		const version = await getAppVersion();
		const client = new DailyWallpaper();

		const program = new Command();

		program.version(version, '-v, --version');

		program
			.command('start')
			.description('Start a cron job.')
			.option(
				'-W, --width <number>',
				"Set wallpaper's width. Not required. Can automatically acquire!",
				parseArgv2Integer,
			)
			.option(
				'-H, --height <number>',
				"Set wallpaper's height. Not required. Can automatically acquire!",
				parseArgv2Integer,
			)
			.option(
				'-i, --interval <string>',
				'Interval between two fetching actions, with format of [digit][unit], unit supports s(second),m(minute),h(hour),d(day)',
				parseArgv2Interval,
				DEFAULT_START_OPTIONS.interval,
			)
			.option('-m, --max <number>', 'Keep latest [max] wallpapers in the dir', parseArgv2Integer)
			.option('-s, --startup', 'Whether auto start after your computer launched, default true')
			.action((options) => {
				client.start(options);
			});
		program
			.command('stop')
			.description('Stop all cron jobs.')
			.action(() => {
				client.stop();
			});
		program
			.command('list')
			.description('List all cron jobs in table.')
			.action(() => {
				client.list();
			});
		// https://pm2.keymetrics.io/docs/usage/log-management/
		program
			.command('log')
			.description('Show logs.')
			.option(
				'--lines <number>',
				`Output the last N lines, instead of the last ${DEFAULT_LOG_LINES_COUNT} by default`,
				parseArgv2Integer,
				DEFAULT_LOG_LINES_COUNT,
			)
			.option('--err', 'Only shows error output')
			.action((options) => {
				client.log(options);
			});

		program.parse();
	} catch (e) {
		console.error(e);
	}
}

run();
