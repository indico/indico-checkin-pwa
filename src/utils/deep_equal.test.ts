import {deepEqual} from './deep_equal';

test('test deepEqual()', () => {
  expect(deepEqual(undefined, undefined)).toBe(true);
  expect(deepEqual(null, null)).toBe(true);
  expect(deepEqual(42, 42)).toBe(true);
  expect(deepEqual('foo', 'foo')).toBe(true);

  expect(deepEqual(42, null)).toBe(false);
  expect(deepEqual(null, 42)).toBe(false);

  expect(deepEqual([], [])).toBe(true);
  expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
  expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
  expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);

  expect(deepEqual({}, {})).toBe(true);
  expect(deepEqual({a: 1, b: 2}, {a: 1, b: 2})).toBe(true);
  expect(deepEqual({a: 1, b: 2}, {a: 1, b: 3})).toBe(false);
  expect(deepEqual({a: 1, b: 2}, {a: 1})).toBe(false);
  expect(deepEqual({a: 1}, {a: 1, b: 2})).toBe(false);

  expect(deepEqual('foo', 'bar')).toBe(false);
});
