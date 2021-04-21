import fs from 'fs';
import schedule from 'node-schedule';
import { argv } from 'yargs';
import dayjs from 'dayjs';
import { downloadPicture } from './picture';
import { historyConfig } from './config';
import { isValidInterval } from './params';
import type { FinalParams } from '../typings';

const { width, height, max, interval } = argv as FinalParams;
const params = {
    width,
    height,
    max,
};
console.log('params', params);

function parseInterval(val?: string) {
    if (isValidInterval(val)) {
        const res = val!.match(/(\d+)(s|m|h|d)$/);
        const num = Number(res![1]);
        if (val!.endsWith('s')) {
            // 秒
            return `*/${num} * * * * *`;
        } else if (val!.endsWith('m')) {
            // 分
            return `*/${num} * * * *`;
        } else if (val!.endsWith('h')) {
            // 时
            return `*/${num} * * *`;
        } else if (val!.endsWith('d')) {
            // 天
            const rule = new schedule.RecurrenceRule();
            let day = (dayjs().day() + num) % 7;
            const dayOfWeek: number[] = [];
            while (!dayOfWeek.includes(day)) {
                dayOfWeek.push(day);
                day = (day + num) % 7;
            }
            rule.dayOfWeek = dayOfWeek;
            rule.hour = dayjs().hour();
            rule.minute = dayjs().minute();
            rule.second = dayjs().second();
            return rule;
        }
    }
    // 默认每12h获取一次
    return '*/12 * * *';
}

function saveHistoryConfig() {
    try {
        fs.writeFileSync(
            historyConfig,
            JSON.stringify(
                {
                    width,
                    height,
                    max,
                    interval,
                },
                null,
                2
            )
        );
    } catch (e) {
        console.error(e);
    }
}

saveHistoryConfig();
downloadPicture(params);
schedule.scheduleJob(parseInterval(interval), () => {
    downloadPicture(params);
});
