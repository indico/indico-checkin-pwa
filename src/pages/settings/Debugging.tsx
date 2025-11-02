import {ArrowPathIcon, DocumentDuplicateIcon} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';
import Button, {DangerButton} from '../../Components/Tailwind/Button';
import TopNav from '../../Components/TopNav';
import {Log} from '../../context/LogsProvider';
import db from '../../db/db';
import {useHandleError} from '../../hooks/useError';
import {useLogs} from '../../hooks/useLogs';
import {useConfirmModal} from '../../hooks/useModal';

export default function DebuggingPage() {
  const version = import.meta.env.VITE_APP_VERSION;
  const isProduction = import.meta.env.PROD;
  const {logs} = useLogs();
  const confirmModal = useConfirmModal();
  const handleError = useHandleError();

  async function resetApp() {
    localStorage.clear();
    try {
      await db.delete();
      await db.open();
    } catch (e) {
      handleError(e, 'Error resetting the database');
    }
  }

  function onCopyLogs() {
    const text = `App version: ${version}\n\nLogs:\n${formatLogs(logs)}`;
    navigator.clipboard.writeText(text);
  }

  return (
    <>
      <TopNav backBtnText="Debugging" backNavigateTo="/settings" />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Typography variant="h4">Reset</Typography>
            <Typography variant="body2">Delete all application data</Typography>
          </div>
          <div>
            <DangerButton
              className="w-fit self-center"
              onClick={() => {
                confirmModal({
                  title: 'Are you sure?',
                  content: 'This will permanently delete all application data',
                  confirmBtnText: 'Reset',
                  onConfirm: resetApp,
                });
              }}
            >
              <ArrowPathIcon className="h-5 min-w-[1.25rem]" />
              Reset
            </DangerButton>
          </div>
        </div>

        {!isProduction && (
          <div>
            <Typography variant="h4" className="mb-4">
              Logs
            </Typography>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Typography variant="h4">Copy to clipboard</Typography>
                </div>
                <div>
                  <Button onClick={onCopyLogs}>
                    <DocumentDuplicateIcon className="h-5 min-w-[1.25rem]" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {logs.length === 0 && <Typography variant="body2">No logs available</Typography>}
                {logs.length > 0 && (
                  <div className="flex max-h-[40vh] flex-col-reverse overflow-y-auto rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                    <code className="flex flex-col gap-2">
                      {logs.map((log, idx) => (
                        <Typography key={idx} variant="body3" className="break-all">
                          <LogEntry log={log} />
                        </Typography>
                      ))}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function LogEntry({log}: {log: Log}) {
  return (
    <>
      <b>{log.timestamp.toISOString().slice(0, -5)}</b> {log.severity.toUpperCase().padStart(5)}{' '}
      {log.message}
    </>
  );
}

export function formatLog(log: Log) {
  return `${log.timestamp.toISOString().slice(0, -5)} ${log.severity.toUpperCase().padStart(5)} ${
    log.message
  }`;
}

export function formatLogs(logs: Log[]) {
  return logs.map(formatLog).join('\n');
}
