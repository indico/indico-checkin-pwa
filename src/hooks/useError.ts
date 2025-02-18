import {useCallback} from 'react';
import {LogMessage} from '../context/LogsProvider';
import {ErrorModalFunction} from '../context/ModalContextProvider';
import {FailedResponse} from '../utils/client';
import {useLogMessage} from './useLogs';
import {useErrorModal} from './useModal';

function displayFetchError(
  response: FailedResponse,
  msg: string,
  errorModal: ErrorModalFunction,
  autoClose?: boolean
) {
  if (response.network || response.aborted) {
    // Either a network error in which case we fallback to indexedDB,
    // or aborted because the component unmounted
    return;
  } else if (response.err) {
    errorModal({title: msg, content: String(response.err), autoClose});
  } else {
    errorModal({title: msg, content: `Response status: ${response.status}`, autoClose});
  }
}

function displayGenericError(
  err: unknown,
  msg: string,
  errorModal: ErrorModalFunction,
  autoClose?: boolean
) {
  errorModal({title: msg, content: String(err), autoClose});
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

function logGenericError(obj: unknown, logMessage: LogMessage) {
  logMessage('error', String(obj));
}

function isResponse(obj: FailedResponse | unknown): obj is FailedResponse {
  return (obj as FailedResponse)?.ok !== undefined;
}

/**
 * Log an error. The error can be viewed on the settings page under the 'logs' section.
 * @param obj A FailedResponse object or some other value, typically an Error object
 * @param logMessage The function returned from 'useLogMessage'
 */
export function logError(obj: FailedResponse | unknown, logMessage: LogMessage) {
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
  obj: FailedResponse | unknown,
  msg: string,
  errorModal: ErrorModalFunction,
  logMessage: LogMessage,
  autoClose?: boolean
) {
  logError(obj, logMessage);
  if (isResponse(obj)) {
    displayFetchError(obj, msg, errorModal, autoClose);
  } else {
    displayGenericError(obj, msg, errorModal, autoClose);
  }
}

/**
 * A React hook for 'logError'
 */
export const useLogError = () => {
  const logMessage = useLogMessage();
  return useCallback((obj: FailedResponse | unknown) => logError(obj, logMessage), [logMessage]);
};

/**
 * A React hook for 'handleError'
 */
export const useHandleError = () => {
  const errorModal = useErrorModal();
  const logMessage = useLogMessage();
  return useCallback(
    (obj: FailedResponse | unknown, msg: string, autoClose?: boolean) =>
      handleError(obj, msg, errorModal, logMessage, autoClose),
    [errorModal, logMessage]
  );
};

/**
 * The type of the function returned by 'useHandleError()'
 */
export type HandleError = (obj: FailedResponse | unknown, msg: string, autoClose?: boolean) => void;
