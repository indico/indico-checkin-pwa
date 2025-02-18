import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {VideoCameraSlashIcon} from '@heroicons/react/20/solid';
import QrScannerPlugin, {
  FileUploadScanner,
  scanFile,
} from '../../Components/QrScanner/QrScannerPlugin';
import {Typography} from '../../Components/Tailwind';
import LoadingBanner from '../../Components/Tailwind/LoadingBanner';
import TopNav from '../../Components/TopNav';
import {useHandleError} from '../../hooks/useError';
import {useMediaQuery} from '../../hooks/useMediaQuery';
import {useErrorModal} from '../../hooks/useModal';
import {camelizeKeys} from '../../utils/case';
import {useIsOffline} from '../../utils/client';
import {validateEventData, parseQRCodeParticipantData} from '../Auth/utils';
import {handleEvent, handleParticipant} from './scan';

interface ScanProps {
  autoCheckin?: boolean;
}

export default function Scan({autoCheckin = false}: ScanProps) {
  const [hasPermission, setHasPermission] = useState(true);
  const [processing, setProcessing] = useState(false); // Determines if a QR Code is being processed
  const navigate = useNavigate();
  const errorModal = useErrorModal();
  const handleError = useHandleError();
  const offline = useIsOffline();
  const isDesktop = useMediaQuery('(min-width: 1280px)');

  async function processCode(decodedText: string) {
    if (processing) {
      // Prevent multiple scans at the same time
      return;
    }
    setProcessing(true);

    let scannedData;
    try {
      scannedData = JSON.parse(decodedText);
    } catch (e) {
      handleError(e, 'Error parsing the QRCode data', autoCheckin);
      return;
    }

    scannedData = camelizeKeys(scannedData);
    if (validateEventData(scannedData)) {
      if (offline) {
        errorModal({
          title: 'You are offline',
          content: 'Internet connection is required to add a registration form',
          autoClose: autoCheckin,
        });
        return;
      }

      try {
        await handleEvent(scannedData, errorModal, navigate);
      } catch (e) {
        handleError(e, 'Error processing QR code', autoCheckin);
      }
      return;
    }

    const parsedData = parseQRCodeParticipantData(scannedData);
    if (parsedData) {
      try {
        await handleParticipant(parsedData, errorModal, handleError, navigate, autoCheckin);
      } catch (e) {
        handleError(e, 'Error processing QR code', autoCheckin);
      }
    } else {
      errorModal({
        title: 'QR code data is not valid',
        content: 'Some fields are missing. Please try again',
        autoClose: autoCheckin,
      });
    }
  }

  const onScanResult = async (decodedText: string, _: unknown) => {
    try {
      await processCode(decodedText);
    } catch (e) {
      handleError(e, 'Error processing QR code', autoCheckin);
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
      <TopNav backBtnText={autoCheckin ? 'Self Check-in' : 'Scan'} backNavigateTo={-1} />
      {!processing && (
        <div className="mt-[-1rem]">
          <QrScannerPlugin qrCodeSuccessCallback={onScanResult} onPermRefused={onPermRefused} />
        </div>
      )}
      {processing && <LoadingBanner text="Loading.." />}
      {!processing && !hasPermission && (
        <div className="mx-4 mt-2 rounded-xl bg-gray-100 dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center gap-2 px-6 pb-12 pt-10">
            <VideoCameraSlashIcon className="w-20 text-gray-500" />
            <Typography variant="h3" className="text-center">
              Please give permission to access the camera and refresh the page
            </Typography>
          </div>
        </div>
      )}
      {fileUploadVisible && (
        <div className="mt-6">
          <FileUploadScanner onFileUpload={onFileUpload} />
        </div>
      )}
    </div>
  );
}
