import Table from 'cli-table3';
import chalk from 'chalk';

describe('dwp list: table style', () => {
  test('custom border color', () => {
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
      head: ['PID', 'Uptime', 'Memory', 'CPU%', 'Memory%', 'Options'],
    });
    table.push([1, 1, 1, 1, 1, 1]);
    console.log(table.toString());
  });
});
