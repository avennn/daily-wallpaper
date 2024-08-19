export interface WriteFileOptions {
  encoding: string | null;
  mode: number;
  flag: string;
}

export interface RawOptions {
  width?: number;
  height?: number;
  max?: number;
  interval: string;
  startup?: boolean;
}

export interface FinalOptions {
  width: number;
  height: number;
  max: number;
  interval: string;
  startup: boolean;
}
