import { exec, spawn } from 'child_process';
import { checkIfDebugMode } from './utils';
import logger from './logger';

interface ParsePsResult {
    pid: string;
    upTime?: string;
    cpuPercent?: string;
    memoryPercent?: string;
}

export function parsePs(pids: string[]): Promise<ParsePsResult[]> {
    const isDebug = checkIfDebugMode();
    return new Promise((resolve) => {
        const colKeys = ['etime', 'pcpu', 'pmem'];
        // TODO: different shell
        exec(
            `ps -p ${pids.join(',')} -O ${colKeys.join(',')} | grep ${
                isDebug ? 'daily-wallpaper' : 'dwp'
            }`,
            (error, stdout) => {
                if (error) {
                    console.log(error);
                    logger.error('parsePs error\n', error);
                    resolve([]);
                    return;
                }
                // pid etime pcpu pmem
                const rawRows = stdout.split('\n').filter(Boolean);
                const rows: ParsePsResult[] = [];
                rawRows.forEach((row) => {
                    const [pid, upTime, cpuPercent, memoryPercent] = row.split(
                        /\s+/
                    );
                    rows.push({
                        pid,
                        upTime,
                        cpuPercent: parseFloat(cpuPercent) + '%',
                        memoryPercent: parseFloat(memoryPercent) + '%',
                    });
                });
                resolve(rows.filter((r) => pids.includes(r.pid)));
            }
        );
    });
}

interface ParseTopResult {
    pid: string;
    memory?: string;
}

function parseTop(pids: string[]): Promise<ParseTopResult[]> {
    return new Promise((resolve) => {
        const args: string[] = [];
        pids.forEach((pid) => {
            // TODO: different shell
            args.push('-pid', String(pid));
        });
        const subProcess = spawn('top', args);

        subProcess.stdout.on('data', (data) => {
            subProcess.kill('SIGKILL');

            const rows = data.toString().split('\n');
            const splitIndex = rows.findIndex((row: string) => row === '');
            const headerRow = rows[splitIndex + 1];
            const contentRows = [];
            for (let i = splitIndex + 2; i < rows.length; i++) {
                if (rows[i]) {
                    contentRows.push(rows[i]);
                }
            }
            const colKeys: string[] = headerRow
                .split(/\s+/)
                .map((item: string) => item.toLowerCase());
            const result: Record<string, string>[] = [];
            contentRows.forEach((row) => {
                const cols = row.split(/\s+/);
                const obj: Record<string, string> = {};
                for (let j = 0; j < colKeys.length; j++) {
                    const key = colKeys[j];
                    obj[key] = cols[j];
                }
                result.push(obj);
            });
            resolve(
                result
                    .filter((item) => pids.includes(item.pid))
                    .map((item) => ({ pid: item.pid, memory: item.mem }))
            );
        });

        subProcess.stderr.on('data', (data) => {
            logger.info('parseTop error', data);
            subProcess.kill('SIGKILL');
            resolve([]);
        });

        subProcess.on('close', (code) => {
            logger.info(`parseTop exit with code ${code}`);
        });
    });
}

export interface ProcessInfo extends ParsePsResult, ParseTopResult {}

export async function getProcessesInfo(pids: string[]): Promise<ProcessInfo[]> {
    const psList = await parsePs(pids);
    const topList = await parseTop(pids);
    const result: ProcessInfo[] = [];
    pids.forEach((pid) => {
        const item = {} as ProcessInfo;
        const psItem = psList.find((item) => item.pid === pid);
        const topItem = topList.find((item) => item.pid === pid);
        if (psItem) {
            Object.assign(item, psItem);
        }
        if (topItem) {
            Object.assign(item, topItem);
        }
        result.push(item);
    });
    return result;
}
