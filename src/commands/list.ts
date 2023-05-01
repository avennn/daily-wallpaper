import chalk from 'chalk';
import Table from 'cli-table3';
import { logger } from '../logger';
import { getProcessesInfo, ProcessInfo } from '../shell';
import { findRunningTasks } from '../utils';

export default async function list(): Promise<void> {
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
