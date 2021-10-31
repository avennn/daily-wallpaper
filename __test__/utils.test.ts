import { parseInterval } from '../src/utils';

describe('parseInterval', () => {
    test('parse second', () => {
        expect(parseInterval('5s')).toHaveProperty('seconds', 5);
    });
    test('parse minute', () => {
        expect(parseInterval('9min')).toHaveProperty('minutes', 9);
    });
    test('parse hour', () => {
        expect(parseInterval('3h')).toHaveProperty('hours', 3);
    });
    test('parse day', () => {
        expect(parseInterval('12d')).toHaveProperty('days', 12);
    });
    test('can handle string with space at left or right side', () => {
        expect(parseInterval(' 3h ')).toHaveProperty('hours', 3);
    });
    test('input without unit fallback to default', () => {
        expect(parseInterval('5')).toHaveProperty('days', 1);
    });
});
