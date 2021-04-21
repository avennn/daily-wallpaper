export interface WriteFileOptions {
    encoding: string | null;
    mode: number;
    flag: string;
}

export interface InputParams extends Record<string, any> {
    width: number;
    height: number;
    max: number;
    interval: string;
    startup: boolean;
    history: boolean;
}

export interface YargsArgv {
    _: (string | number)[];
    $0: string;
    width?: number;
    height?: number;
    max?: number;
    interval?: string;
    history?: boolean;
    startup?: boolean;
    [key: string]: any;
}

export interface FinalParams {
    _: (string | number)[];
    $0: string;
    width: number;
    height: number;
    max: number;
    interval: string;
    startup: boolean;
    [key: string]: unknown;
}
