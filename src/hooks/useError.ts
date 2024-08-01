import {useCallback} from 'react';
import {LogMessage} from '../context/LogsProvider';
import {ErrorModalFunction} from '../context/ModalContextProvider';
import {FailedResponse} from '../utils/client';
import {useLogMessage} from './useLogs';
import {useErrorModal} from './useModal';

function displayFetchError(response: FailedResponse, msg: string, errorModal: ErrorModalFunction) {
  if (response.network || response.aborted) {
    // Either a network error in which case we fallback to indexedDB,
    // or aborted because the component unmounted
    return;
  } else if (response.err) {
    errorModal({title: msg, content: String(response.err)});
  } else {
    errorModal({title: msg, content: `Response status: ${response.status}`});
  }
}

function displayGenericError(err: any, msg: string, errorModal: ErrorModalFunction) {
  errorModal({title: msg, content: String(err)});
}

function logFetchError(response: FailedResponse, logMessage: LogMessage) {
  if (response.aborted) {
    // Aborted because the component unmounted
    return;
  }

  let msg = `${response.endpoint} ${JSON.stringify(response.options)}`;
  const fields = ['status', 'err', 'data', 'description'] as (keyof FailedResponse)[];
  for (const field of fields) {
    if (response[field]) {
      if (field === 'data') {
        msg += ` ${JSON.stringify(response[field])}`;
      } else {
        msg += ` ${response[field]}`;
      }
    }
  }

  logMessage('error', msg);
}

function logGenericError(obj: any, logMessage: LogMessage) {
  logMessage('error', String(obj));
}

function isResponse(obj: FailedResponse | any): obj is FailedResponse {
  return obj.ok !== undefined;
}

/**
 * Log an error. The error can be viewed on the settings page under the 'logs' section.
 * @param obj A FailedResponse object or some other value, typically an Error object
 * @param logMessage The function returned from 'useLogMessage'
 */
export function logError(obj: FailedResponse | any, logMessage: LogMessage) {
  if (isResponse(obj)) {
    logFetchError(obj, logMessage);
  } else {
    logGenericError(obj, logMessage);
  }
}

/**
 * Log and display an error to the user. The detailed error can be viewed on the
 * settings page under the 'logs' section.
 * @param obj A FailedResponse object or some other value, typically an Error object
 * @param msg A message to display to the user
 * @param errorModal The function returned from 'useErrorModal'
 * @param logMessage The function returned from 'useLogMessage'
 */
export function handleError(
  obj: FailedResponse | any,
  msg: string,
  errorModal: ErrorModalFunction,
  logMessage: LogMessage
) {
  logError(obj, logMessage);
  if (isResponse(obj)) {
    displayFetchError(obj, msg, errorModal);
  } else {
    displayGenericError(obj, msg, errorModal);
  }
}

/**
 * A React hook for 'logError'
 */
export const useLogError = () => {
  const logMessage = useLogMessage();
  return useCallback((obj: FailedResponse | any) => logError(obj, logMessage), [logMessage]);
};

/**
 * A React hook for 'handleError'
 */
export const useHandleError = () => {
  const errorModal = useErrorModal();
  const logMessage = useLogMessage();
  return useCallback(
    (obj: FailedResponse | any, msg: string) => handleError(obj, msg, errorModal, logMessage),
    [errorModal, logMessage]
  );
};

/**
 * The type of the function returned by 'useHandleError()'
 */
export type HandleError = (obj: FailedResponse | any, msg: string) => void;
