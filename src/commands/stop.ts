import chalk from 'chalk';
import ps from 'ps-node';
import { echoLogger as echo, logger } from '../logger';
import { findRunningTasks } from '../utils';

export default async function stop(): Promise<void> {
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
