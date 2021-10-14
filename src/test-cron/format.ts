import dayjs from 'dayjs';

export function formatTime(date: Date) {
    return dayjs(date || undefined).format('YYYY-MM-DD HH:mm:ss:SSS');
}
