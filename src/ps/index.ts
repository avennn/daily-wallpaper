// https://man7.org/linux/man-pages/man1/ps.1.html
/**
 * UNIX格式，短选项，可以组合，以一个横杠开头
 * BSD格式，短选项，可以组合，不横杠开头
 * GNU格式，长选项，双横杠开头
 */
/**
  标准语法查所有
  ps -e
  ps -ef
  ps -eF zsh不支持
  ps -ely zsh不支持
  BSD语法查所有
  ps ax
  ps aux ax和aux返回格式不同
 */
// a选择所有有tty的进程
// ax, -A, -e选择所有进程
// -a选择所有除了session leaders和没有关联tty的进程
// -d选择所有除了session leaders的进程
// -N, --deselect反选
// T, t 当前tty关联的进程
// r只在跑着的进程
import { exec } from 'node:child_process';

interface Options {
	realUserIdOrNameList: (string | number)[];
	effectiveUserIdOrNameList: (string | number)[];
	all: boolean;
}

export enum PsFormattedKey {
	pid = 'pid',
	tty = 'tty',
	cputime = 'cputime',
	command = 'command',
	arguments = 'arguments',
}

type FormattedKey =
	| PsFormattedKey
	| {
			key: PsFormattedKey;
			cols?: string[]; // 自定义key对应的col，如果没有，则使用内部推断的
			transformer?: (source: string) => string;
			noArguments?: boolean; // key为command时才有效
	  };

const equivalentCols: string[][] = [
	['uid', 'euid'],
	['user', 'euser', 'uname'],
	// zsh实测，ucmd没有，ucomm只显示执行文件名，comm显示完整执行路径
	['comm', 'ucomm', 'ucmd'],
	// 命令+参数
	['command', 'args'],
	['cputime', 'time'],
	['cputimes', 'times'], // 以秒为单位显示
];

interface ColTransformer {
	col: string;
	transformer?: ((source?: string) => unknown) | null;
}

type KeyColType = 'default' | 'noArguments';
type KeyCol = {
	[P in KeyColType]?: (string | ColTransformer)[];
};
type SerializeKeyCol = {
	[P in KeyColType]?: ColTransformer[];
};

const key2ColMap = generateKey2ColMap();

function generateKey2ColMap() {
	const originMap: Record<string, KeyCol> = {
		[PsFormattedKey.pid]: {
			default: ['pid'],
		},
		[PsFormattedKey.tty]: {
			default: ['tty', { col: 'tt', transformer: (source?: string) => `tty${source}` }],
		},
		[PsFormattedKey.command]: {
			default: ['command', 'args'],
			noArguments: ['comm', 'ucomm', 'ucmd'],
		},
		[PsFormattedKey.arguments]: {
			default: [
				{
					col: 'command',
					transformer: (source?: string) => {
						const arr = source?.trim().split(' ');
						arr?.splice(0, 1);
						return arr || [];
					},
				},
				{
					col: 'args',
					transformer: (source?: string) => {
						const arr = source?.trim().split(' ');
						arr?.splice(0, 1);
						return arr || [];
					},
				},
			],
		},
		[PsFormattedKey.cputime]: {
			default: ['cputime', 'time'],
		},
	};
	// 序列化成标准格式
	const map: Record<string, SerializeKeyCol> = {};
	Object.keys(originMap).forEach((key) => {
		const colObj = originMap[key];
		map[key] = {};
		Object.keys(colObj).forEach((type) => {
			map[key][type as KeyColType] = [];
			const arr = colObj[type as KeyColType];
			arr?.forEach((item) => {
				if (typeof item === 'string') {
					// @ts-ignore
					map[key][type as KeyColType].push({
						col: item,
						transformer: null,
					});
				} else if (typeof item === 'object' && item !== null) {
					// @ts-ignore
					map[key][type as KeyColType].push({
						col: item.col,
						transformer: item.transformer || null,
					});
				}
			});
		});
	});

	return map;
}

type Task = () => Promise<void> | void;

type Transformer = (source?: string) => unknown;

export default class Ps {
	private options: Options;
	private col2Keys: Record<string, { key: PsFormattedKey; transformer?: Transformer | null }[]>;
	private taskQueue: Task[];

	static currentTty = Symbol('ps.currentTty');
	static defaultKeys = [PsFormattedKey.pid, PsFormattedKey.tty, PsFormattedKey.cputime, PsFormattedKey.command];

	constructor(options?: Options) {
		this.options = Object.assign(
			{
				realUserIdOrNameList: [],
				effectiveUserIdOrNameList: [],
				all: false,
				raw: false, // 默认格式化成统一且美观的格式
			},
			options,
		);
		this.col2Keys = {};
		this.taskQueue = [];
	}

	static getAvaliableCols(): Promise<string[]> {
		return new Promise((resolve, reject) => {
			// 在zsh上测得
			exec('ps -L', (err, stdout) => {
				if (err) {
					reject(err);
					return;
				}
				// 兼容不同平台换行符
				resolve(stdout.trim().split(/[\s\n]/));
			});
		});
	}

	keys(expectKeys: FormattedKey[] | (() => FormattedKey[])): Ps {
		this.addTask(() => this._keys(expectKeys));
		return this;
	}

	async _keys(expectKeys: FormattedKey[] | (() => FormattedKey[])): Promise<void> {
		const avaliableCols = await Ps.getAvaliableCols();
		const formattedKeys = typeof expectKeys === 'function' ? expectKeys() : expectKeys;

		function reflectCol(reflectCols: ColTransformer[], cols: string[]) {
			return reflectCols.find((colObj) => cols.includes(colObj.col));
		}

		formattedKeys.filter(Boolean).forEach((key) => {
			let reflectCols: ColTransformer[] = [];
			let realKey = '';
			if (typeof key === 'string') {
				realKey = key;
				reflectCols = key2ColMap[realKey]?.default ?? [];
			} else if (typeof key === 'object' && key !== null) {
				realKey = key.key;
				if (Reflect.ownKeys(key).includes('noArguments') && !key.noArguments && key.key === PsFormattedKey.command) {
					reflectCols = key2ColMap[realKey]?.noArguments ?? [];
				}
			}
			if (reflectCols.length) {
				const colObj = reflectCol(reflectCols, avaliableCols);
				if (colObj) {
					if (!this.col2Keys[colObj.col]) {
						this.col2Keys[colObj.col] = [];
					}
					this.col2Keys[colObj.col].push({
						key: realKey as PsFormattedKey,
						transformer: colObj.transformer,
					});
				}
			}
		});
	}

	addTask(task: Task): void {
		this.taskQueue.push(task);
	}

	all(): Ps {
		this.addTask(() => this._all());
		return this;
	}

	_all(): void {
		this.options['all'] = true;
	}

	filterByTty(ttyList: symbol | string[]): Ps {
		return this;
	}

	filterByRealUserIdOrName(realUserIdOrNameList: (string | number)[]): Ps {
		if (Array.isArray(realUserIdOrNameList) && realUserIdOrNameList.length) {
			this.options.realUserIdOrNameList = realUserIdOrNameList;
		}
		return this;
	}
	filterByEffectiveUserIdOrName(effectiveUserIdOrNameList: (string | number)[]): Ps {
		if (Array.isArray(effectiveUserIdOrNameList) && effectiveUserIdOrNameList.length) {
			this.options.effectiveUserIdOrNameList = effectiveUserIdOrNameList;
		}
		return this;
	}

	sort(): Ps {
		return this;
	}

	createParams(): string {
		const params = [];
		const { all, realUserIdOrNameList, effectiveUserIdOrNameList } = this.options;

		if (all) {
			params.push('-e');
		} else {
			// 真实用户id或者姓名，谁创建了该进程
			if (realUserIdOrNameList?.length) {
				params.push(`-U ${realUserIdOrNameList.join(',')}`);
			}
			// 有效用户id或者姓名，进程使用了谁的文件访问权限，mac上跟realUserIdOrNameList是一样的
			if (effectiveUserIdOrNameList?.length) {
				params.push(`-u ${effectiveUserIdOrNameList.join(',')}`);
			}
		}

		const cols = this.outputCols;
		if (cols.length) {
			params.push(`-o ${cols.join(',')}`);
		}

		return params.join(' ');
	}

	get outputCols(): string[] {
		// 把cmd放到最后，便于处理文本分割
		const cols = Object.keys(this.col2Keys);
		cols.sort((a) => {
			if (['command', 'args', 'comm', 'ucomm', 'ucmd'].includes(a)) {
				return 1;
			}
			return -1;
		});
		return cols;
	}

	format(stdout: string): unknown[] {
		const rows = stdout.trim().split('\n');
		const cols = this.outputCols;
		const colSize = cols.length;
		const result = rows.map((row) => {
			const formatted: Record<string, unknown> = {};
			const colValues = row.trim().split(/\s+/);
			let index = 0;
			const newColValues = [];
			while (index < colSize - 1) {
				newColValues.push(colValues.shift());
				index++;
			}
			if (colValues.length) {
				newColValues.push(colValues.join(' '));
			}
			newColValues.forEach((source, i) => {
				const keyObjs = this.col2Keys[cols[i]];
				for (const keyObj of keyObjs) {
					formatted[keyObj.key] = keyObj.transformer ? keyObj.transformer(source) : source;
				}
			});
			return formatted;
		});
		// 去除header
		result.splice(0, 1);
		return result;
	}

	get hasInitedKeys(): boolean {
		return !!Object.keys(this.col2Keys).length;
	}

	async execute(): Promise<unknown[]> {
		while (this.taskQueue.length) {
			await (this.taskQueue.shift() as Task)();
		}
		/* eslint-disable-next-line */
		return new Promise(async (resolve, reject) => {
			if (!this.hasInitedKeys) {
				await this._keys(Ps.defaultKeys);
			}
			const cmd = `ps ${this.createParams()}`;
			console.log('cmd: ', cmd);
			exec(cmd, (err, stdout) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(this.format(stdout));
			});
		});
	}
}
