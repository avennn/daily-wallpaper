import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler';
import logger from './logger';
import { formatTime } from './format';

logger('开始时间：', formatTime(new Date()), '\n');
const scheduler = new ToadScheduler();
const task = new Task('simple task', () => {
    logger('每2min执行一次，时间：', formatTime(new Date()), '\n');
});
const job = new SimpleIntervalJob({ minutes: 2 }, task);
scheduler.addSimpleIntervalJob(job);
