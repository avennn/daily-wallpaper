const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const argv = require('yargs').argv;
const dayjs = require('dayjs');
const { downloadPicture } = require('./picture');

const { width, height, max, interval } = argv;
const params = {
    width,
    height,
    max,
};
console.log('params', params);

function isValidInterval(val) {
    return val && /\d+(s|m|h|d)$/.test(val);
}

function parseInterval(val) {
    if (isValidInterval(val)) {
        const res = val.match(/(\d+)(s|m|h|d)$/);
        const num = res[1];
        if (val.endsWith('s')) {
            // 秒
            return `*/${num} * * * * *`;
        } else if (val.endsWith('m')) {
            // 分
            return `*/${num} * * * *`;
        } else if (val.endsWith('h')) {
            // 时
            return `*/${num} * * *`;
        } else if (val.endsWith('d')) {
            // 天
            const rule = new schedule.RecurrenceRule();
            let day = (dayjs().day() + num) % 7;
            const dayOfWeek = [];
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
            '../history.config.json',
            JSON.stringify(argv, null, 2),
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
