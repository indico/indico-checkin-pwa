import {ReactNode, createContext, useCallback, useState} from 'react';
import PropTypes from 'prop-types';

const MAX_LOG_COUNT = 500;

export type Severity = 'info' | 'warn' | 'error';
export type LogMessage = (severity: Severity, message: string) => void;

export interface Log {
  severity: Severity;
  timestamp: Date;
  message: string;
}

export const LogDataContext = createContext<{logs: Log[]}>({
  logs: [],
});

export const LogMessageContext = createContext((_severity: Severity, _message: string) => {});

export const LogsProvider = ({children}: {children: ReactNode}) => {
  const [logs, setLogs] = useState<Log[]>([]);

  const logMessage = useCallback(
    (severity: Severity, message: string) => {
      const timestamp = new Date();
      const log: Log = {severity, timestamp, message};
      setLogs(logs => {
        if (logs.length < MAX_LOG_COUNT) {
          return [...logs, log];
        } else {
          return [...logs.slice(1), log];
        }
      });
    },
    [setLogs]
  );

  return (
    <LogMessageContext.Provider value={logMessage}>
      <LogDataContext.Provider value={{logs}}>{children}</LogDataContext.Provider>
    </LogMessageContext.Provider>
  );
};

LogsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
