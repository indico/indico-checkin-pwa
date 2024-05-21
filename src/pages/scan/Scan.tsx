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
import {useMediaQuery} from '../../hooks/useMediaQuery';
import {useErrorModal} from '../../hooks/useModal';
import useSettings from '../../hooks/useSettings';
import {camelizeKeys} from '../../utils/case';
import {useIsOffline} from '../../utils/client';
import {validateEventData, parseQRCodeParticipantData} from '../Auth/utils';
import {handleEvent, handleParticipant} from './scan';

export default function ScanPage() {
  const [hasPermission, setHasPermission] = useState(true);
  const [processing, setProcessing] = useState(false); // Determines if a QR Code is being processed
  const {autoCheckin} = useSettings();
  const navigate = useNavigate();
  const errorModal = useErrorModal();
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
    } catch (e: any) {
      errorModal({title: 'Error parsing the QRCode data', content: e.message});
      return;
    }

    scannedData = camelizeKeys(scannedData);
    if (validateEventData(scannedData)) {
      if (offline) {
        errorModal({
          title: 'You are offline',
          content: 'Internet connection is required to add a registration form',
        });
        return;
      }

      try {
        await handleEvent(scannedData, errorModal, navigate);
      } catch (e: any) {
        errorModal({title: 'Error processing QR code', content: e.message});
      }
      return;
    }

    const parsedData = parseQRCodeParticipantData(scannedData);
    if (parsedData) {
      try {
        await handleParticipant(parsedData, errorModal, navigate, autoCheckin);
      } catch (e: any) {
        errorModal({title: 'Error processing QR code', content: e.message});
      }
    } else {
      errorModal({
        title: 'QR code data is not valid',
        content: 'Some fields are missing. Please try again',
      });
    }
  }

  const onScanResult = async (decodedText: string, _decodedResult: any) => {
    try {
      await processCode(decodedText);
    } catch (e: any) {
      errorModal({title: 'Error processing QR code', content: e.message});
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
    } catch (e: any) {
      errorModal({title: 'Error processing QR code', content: e.message});
    }
  };

  const fileUploadVisible = !processing && (isDesktop || process.env.NODE_ENV === 'development');

  return (
    <div>
      <TopNav backBtnText="Scan" backNavigateTo={-1} />
      {!processing && (
        <div className="mt-[-1rem]">
          <QrScannerPlugin qrCodeSuccessCallback={onScanResult} onPermRefused={onPermRefused} />
        </div>
      )}
      {processing && <LoadingBanner text="Loading.." />}
      {!hasPermission && (
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
