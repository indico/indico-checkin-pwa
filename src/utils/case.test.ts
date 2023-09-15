import {camelizeKeys} from './case';

test('test camelizeKeys()', () => {
  expect(camelizeKeys(undefined)).toBe(undefined);
  expect(camelizeKeys(null)).toBe(null);
  expect(camelizeKeys(42)).toBe(42);
  expect(camelizeKeys('snake_case')).toBe('snake_case');

  expect(camelizeKeys([])).toEqual([]);
  expect(camelizeKeys([1, 'snake_case'])).toEqual([1, 'snake_case']);

  expect(camelizeKeys({})).toEqual({});
  expect(camelizeKeys({event_id: 42})).toEqual({eventId: 42});
  expect(camelizeKeys({eventId: 42})).toEqual({eventId: 42});
  expect(camelizeKeys({a_b_1_2: 42})).toEqual({aB12: 42});

  expect(camelizeKeys({event_id: 42, registration_id: 123})).toEqual({
    eventId: 42,
    registrationId: 123,
  });

  expect(
    camelizeKeys({registration_id: 123, registration_data: [{field_id: 23, full_name: 'John Doe'}]})
  ).toEqual({
    registrationId: 123,
    registrationData: [{fieldId: 23, fullName: 'John Doe'}],
  });
});
