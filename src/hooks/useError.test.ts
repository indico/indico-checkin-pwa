import {FailedResponse} from '../utils/client';
import {handleError, logError} from './useError';

describe('test error handling', () => {
  const inputs = [
    [
      {
        ok: false,
        status: 500,
        endpoint: 'api/checkin/event/1',
        options: {method: 'GET'},
        data: 'something went wrong',
      },
      'api/checkin/event/1 {"method":"GET"} 500 "something went wrong"',
      'Response status: 500',
    ],
    [
      {
        ok: false,
        endpoint: 'api/checkin/event/1',
        options: {method: 'GET'},
        err: new Error('network unreachable'),
      },
      'api/checkin/event/1 {"method":"GET"} Error: network unreachable',
      'Error: network unreachable',
    ],
    [
      new TypeError('undefined has no properties'),
      'TypeError: undefined has no properties',
      'TypeError: undefined has no properties',
    ],
    ['Unhandled Promise Rejection', 'Unhandled Promise Rejection', 'Unhandled Promise Rejection'],
  ];

  test('test logError()', async () => {
    const logMessage = vi.fn();

    for (const [err, msg] of inputs) {
      logError(err as FailedResponse, logMessage);
      expect(logMessage).toHaveBeenCalledWith('error', msg);
    }
  });

  test('test handleError()', async () => {
    const errorModal = vi.fn();
    const logMessage = vi.fn();

    for (const [err, , msg] of inputs) {
      handleError(err as FailedResponse, 'Something went wrong', errorModal, logMessage);
      expect(logMessage).toHaveBeenCalled();
      expect(errorModal).toHaveBeenCalledWith({title: 'Something went wrong', content: msg});
    }
  });
});
