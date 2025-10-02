import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {VideoCameraSlashIcon, QrCodeIcon} from '@heroicons/react/20/solid';
import QrScannerPlugin, {
  FileUploadScanner,
  scanFile,
} from '../../Components/QrScanner/QrScannerPlugin';
import {Typography} from '../../Components/Tailwind';
import LoadingBanner from '../../Components/Tailwind/LoadingBanner';
import TopNav from '../../Components/TopNav';
import {useHandleError, useLogError} from '../../hooks/useError';
import {useMediaQuery} from '../../hooks/useMediaQuery';
import {useErrorModal} from '../../hooks/useModal';
import useSettings from '../../hooks/useSettings';
import {useIsOffline} from '../../utils/client';
import {scanDevices} from '../../utils/scan_device';
import {processCode} from './scan';

export default function ScanPage() {
  const [hasPermission, setHasPermission] = useState(true);
  const [processing, setProcessing] = useState(false); // Determines if a QR Code is being processed
  const {autoCheckin, rapidMode, scanDevice} = useSettings();
  const navigate = useNavigate();
  const errorModal = useErrorModal();
  const handleError = useHandleError();
  const offline = useIsOffline();
  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const logError = useLogError();
  const scanWithCamera = scanDevice !== scanDevices.externalKeyboard;
  const scanWithKeyboard = scanDevice !== scanDevices.camera;

  const onScanResult = async (decodedText: string, _: unknown) => {
    try {
      await processCode(
        decodedText,
        processing,
        setProcessing,
        offline,
        navigate,
        errorModal,
        handleError,
        logError,
        autoCheckin,
        rapidMode
      );
    } catch (e) {
      handleError(e, 'Error processing QR code');
    } finally {
      setProcessing(false);
    }

    // TODO: Make QR Code UI More responsive to what is happening
  };

  const onPermRefused = () => {
    setHasPermission(false);
  };

  const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const decodedText = await scanFile(file);
      onScanResult(decodedText, null);
    } catch (e) {
      errorModal({title: 'Error processing QR code', content: e instanceof Error ? e.message : ''});
    }
  };

  const fileUploadVisible = !processing && (isDesktop || import.meta.env.DEV);

  return (
    <div>
      <TopNav backBtnText="Scan" backNavigateTo={-1} />
      {scanWithCamera && !processing && (
        <div className="mt-[-1rem]">
          <QrScannerPlugin qrCodeSuccessCallback={onScanResult} onPermRefused={onPermRefused} />
        </div>
      )}
      {processing && <LoadingBanner text="Loading.." />}
      {!processing && !hasPermission && scanWithCamera && (
        <div className="mx-4 mt-2 rounded-xl bg-gray-100 dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center gap-2 px-6 pb-12 pt-10">
            <VideoCameraSlashIcon className="w-20 text-gray-500" />
            <Typography variant="h3" className="text-center">
              Please give permission to access the camera and refresh the page
            </Typography>
          </div>
        </div>
      )}
      {scanWithKeyboard && (
        <>
          {!scanWithCamera && !processing && (
            <div className="mx-4 mt-2 rounded-xl bg-gray-100 dark:bg-gray-800">
              <div className="flex flex-col items-center justify-center gap-2 px-6 pb-12 pt-10">
                <QrCodeIcon className="w-20 text-gray-500" />
                <Typography variant="h3" className="text-center">
                  Awaiting input from a scanner device
                </Typography>
              </div>
            </div>
          )}
        </>
      )}
      {fileUploadVisible && (
        <div className="mt-6">
          <FileUploadScanner onFileUpload={onFileUpload} />
        </div>
      )}
    </div>
  );
}
