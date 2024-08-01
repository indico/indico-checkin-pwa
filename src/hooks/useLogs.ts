import {useContext} from 'react';
import {LogMessageContext, LogDataContext} from '../context/LogsProvider';

export const useLogMessage = () => {
  return useContext(LogMessageContext);
};

export const useLogs = () => {
  return useContext(LogDataContext);
};
