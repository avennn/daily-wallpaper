#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { safeJsonParse } from 'tori';
import { createOptionArgs } from './src/command';
import { start, stop, list } from './src/index';

try {
    const pkgJsonText = fs.readFileSync(
        path.join(__dirname, '../package.json'),
        {
            encoding: 'utf8',
        }
    );
    const { version } = safeJsonParse(pkgJsonText, {});

    const program = new Command();
    program.version(version, '-v, --version');
    program
        .command('start')
        .description('start schedule')
        .option(
            ...(createOptionArgs('width') as [string, string, () => number])
        )
        .option(
            ...(createOptionArgs('height') as [string, string, () => number])
        )
        .option(
            ...(createOptionArgs('interval') as [
                string,
                string,
                () => string,
                string
            ])
        )
        .option(...(createOptionArgs('max') as [string, string, () => number]))
        .option(...(createOptionArgs('startup') as [string, string]))
        .option(...(createOptionArgs('no-startup') as [string, string]))
        .option('-d, --debug', 'debug')
        .action((options) => {
            start(options);
        });
    program
        .command('stop')
        .description('stop schedule')
        .action(() => {
            stop();
        });
    program
        .command('list')
        .description('list schedule')
        .action(() => {
            list();
        });

    program.parse();
} catch (e) {
    console.error(e);
}
