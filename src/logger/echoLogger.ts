/**
 * 以表情图开头，打印到控制台
 * 'success' | 'fail' | 'warn' | 'normal'
 */
import cLogger from './cLogger';

type EchoIconKey = 'success' | 'fail' | 'warn' | 'normal';

const echoIcons: Record<EchoIconKey, string> = {
  success: '\u2705',
  fail: '\u274c',
  warn: '💡',
  normal: '\u2728',
};

const echo = {} as Record<EchoIconKey, (...args: unknown[]) => void>;
(['success', 'fail', 'warn', 'normal'] as EchoIconKey[]).forEach((status) => {
  echo[status] = function (...args: unknown[]) {
    cLogger.log(echoIcons[status], ...args);
  };
});

export default echo;
