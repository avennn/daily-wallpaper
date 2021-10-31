import { spawn, exec } from 'child_process';
import path from 'path';
import { RawOptions } from '../types/index';

export function start(rawOptions: RawOptions & { debug: boolean }) {
    console.log('options', rawOptions);
    const isDebug = !!rawOptions.debug;
    const startPath = path.join(
        __dirname,
        `./schedule.${isDebug ? 'ts' : 'js'}`
    );
    console.log('startpath', startPath);
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
        stdio: 'ignore',
    });
    subProcess.unref();
}
