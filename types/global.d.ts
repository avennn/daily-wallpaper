declare module 'topparser' {
    export function start();
    export function on(eventName: string, fn: (...args: any[]) => void);
    export function stop();
}
declare module 'table-parser' {
    export function parse(data: any);
}
