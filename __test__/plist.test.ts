const { getScreenSize } = require('../src/utils');

test('getScreenSize', () => {
    const output = getScreenSize();
    expect(typeof output).toBe('object');
    expect(output).not.toBeNull();
    expect(typeof output.width).toBe('number');
    expect(output.width).toBeGreaterThan(0);
    expect(typeof output.height).toBe('number');
    expect(output.height).toBeGreaterThan(0);
});
