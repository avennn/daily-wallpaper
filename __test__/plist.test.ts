import { getInfo } from 'nc-screen';

test('getScreenSize', () => {
  const output = getInfo();
  expect(typeof output).toBe('object');
  expect(output).not.toBeNull();
  expect(typeof output.width).toBe('number');
  expect(output.width).toBeGreaterThan(0);
  expect(typeof output.height).toBe('number');
  expect(output.height).toBeGreaterThan(0);
});
