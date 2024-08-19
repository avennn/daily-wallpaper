/**
 * 以表情图开头，打印到控制台
 * 'success' | 'fail' | 'warn' | 'normal'
 */
const echoIcons: Record<EchoIconKey, string> = {
	success: '\u2705',
	fail: '\u274c',
	warn: '💡',
	normal: '\u2728',
};

const echo = {} as Record<EchoIconKey, (...args: unknown[]) => void>;
const statusList = ['success', 'fail', 'warn', 'normal'] as const;

type EchoIconKey = (typeof statusList)[number];

for (const status of statusList) {
	echo[status] = (...args: unknown[]) => {
		console.log(echoIcons[status], ...args);
	};
}

export default echo;
