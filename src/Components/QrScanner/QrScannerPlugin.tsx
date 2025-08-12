// file = QrScannerPlugin.jsx
import {MutableRefObject, useEffect, useRef, useState, useCallback} from 'react';
import {ArrowUpTrayIcon} from '@heroicons/react/24/solid';
import {Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats} from 'html5-qrcode';
import {useLogError} from '../../hooks/useError';
import {useErrorModal} from '../../hooks/useModal';
import useSettings from '../../hooks/useSettings';
import {parseQRCodeParticipantData, validateEventData} from '../../pages/Auth/utils';
import {parseCustomQRCodeData} from '../../pages/scan/scan';
import {camelizeKeys} from '../../utils/case';
import {checkCameraPermissions} from '../../utils/media';
import {TorchButton} from './TorchButton';
import classes from './QrScanner.module.css';

// Id of the HTML element used by the Html5QrcodeScanner.
const qrcodeRegionId = 'html5qr-code-full-region';
const qrcodeFileRegionId = 'html5qr-code-file-region';

/**
 * @returns the aspect ratio of the video feed based on the window size
 */
export const calcAspectRatio = () => {
  // TODO: This is not the ideal way to define the aspect ratio. Could find a way to detect the camera orientation
  if (window.innerWidth < window.innerHeight) {
    return 1.333334;
  }
  return 1.777778;
};

export async function scanFile(file: File): Promise<string> {
  const scanner = new Html5Qrcode(qrcodeFileRegionId, {
    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    verbose: import.meta.env.DEV,
  });

  const result = await scanner.scanFileV2(file, false);
  return result.decodedText;
}

interface QrProps {
  fps?: number; // Expected frame rate of qr code scanning. example { fps: 2 } means the scanning would be done every 500 ms.
  qrbox?: number;
  disableFlip?: boolean;
  qrCodeSuccessCallback: (decodedText: string, decodedResult: unknown) => void;
  qrCodeErrorCallback?: (errorMessage: string, error: unknown) => void;
  formatsToSupport?: Html5QrcodeSupportedFormats[];
  onPermRefused: () => void;
}

export default function QrScannerPlugin({
  fps = 10,
  qrbox = 250,
  disableFlip = false,
  formatsToSupport = [Html5QrcodeSupportedFormats.QR_CODE],
  qrCodeSuccessCallback,
  qrCodeErrorCallback,
  onPermRefused,
}: QrProps) {
  const aspectRatio = calcAspectRatio();
  const html5CustomScanner: MutableRefObject<Html5Qrcode | null> = useRef(null);
  const [canUseCamera, setCanUseCamera] = useState(true);
  const logError = useLogError();

  // Turn off the torch (if it is on) when navigating away from the scan page
  const switchOffTorch = useCallback(
    async function switchOffTorch(html5CustomScanner: MutableRefObject<Html5Qrcode | null>) {
      try {
        const track = html5CustomScanner?.current?.getRunningTrackCameraCapabilities();
        if (track && track.torchFeature().value()) {
          await track.torchFeature().apply(false);
        }
      } catch (e) {
        // This raises an error about invalid tracks - we have to catch it! (blame the library)
        console.warn('Failed to disable torch:', e);
        logError(`Failed to disable torch: ${e}`);
      }
    },
    [logError]
  );

  useEffect(() => {
    const showQRCode = async () => {
      const hasCamPerm: boolean = await checkCameraPermissions();
      if (!hasCamPerm) {
        onPermRefused();
        setCanUseCamera(false);
        return;
      }

      const cameraState = html5CustomScanner.current?.getState() || 0;

      if (cameraState <= Html5QrcodeScannerState.UNKNOWN) {
        // when component mounts
        html5CustomScanner.current = new Html5Qrcode(qrcodeRegionId, {
          formatsToSupport,
          verbose: false,
        });

        await html5CustomScanner.current.start(
          {facingMode: 'environment'},
          {fps, qrbox, aspectRatio, disableFlip},
          qrCodeSuccessCallback,
          qrCodeErrorCallback
        );
      }
    };

    showQRCode().catch(err => console.error(err));

    return () => {
      const stopQrScanner = async () => {
        await switchOffTorch(html5CustomScanner);
        if (html5CustomScanner.current?.isScanning) {
          await html5CustomScanner.current.stop();
        }
        html5CustomScanner.current?.clear();
        // Destroy the object
        html5CustomScanner.current = null;
      };

      stopQrScanner();
    };
  }, [
    fps,
    qrbox,
    aspectRatio,
    disableFlip,
    formatsToSupport,
    qrCodeSuccessCallback,
    qrCodeErrorCallback,
    onPermRefused,
    switchOffTorch,
  ]);

  return (
    <>
      <div className={classes.wrapper}>
        <ShadedRegion size={qrbox}></ShadedRegion>
        <div id={qrcodeRegionId} />
      </div>
      <TorchButton html5CustomScanner={html5CustomScanner} canUseCamera={canUseCamera} />
    </>
  );
}

function ShadedRegion({size}: {size: number}) {
  return <div className={classes['shaded-region']} style={{width: size, height: size}}></div>;
}

export function FileUploadScanner({
  onFileUpload,
}: {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex justify-center">
      <input id="qr-file" type="file" accept="image/*" onChange={onFileUpload} className="hidden" />
      <label
        htmlFor="qr-file"
        className="fit-content flex h-fit cursor-pointer gap-2 gap-2 justify-self-center rounded-lg
                   bg-primary px-4 py-3 text-sm font-medium text-white focus:outline-none
                   active:bg-blue-800 dark:bg-blue-600 dark:active:bg-blue-700"
      >
        <ArrowUpTrayIcon className="h-6 w-6" />
        <span>Upload QR code image</span>
      </label>
      <div id={qrcodeFileRegionId}></div>
    </div>
  );
}

interface ExternalQRScannerDeviceProps {
  qrCodeSuccessCallback: (decodedText: string, decodedResult: unknown) => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
}

export function ExternalQRScannerDevice({
  qrCodeSuccessCallback,
  processing,
  setProcessing,
}: ExternalQRScannerDeviceProps) {
  const qrCodeInputRef = useRef<HTMLInputElement | null>(null);
  const scannedStringRef = useRef('');
  const currentKeyRef = useRef('');
  const {customQRCodes} = useSettings();
  const errorModal = useErrorModal();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  async function handleScan(decodedText: string) {
    let scannedData;
    if (decodedText !== '' && !isNaN(Number(decodedText))) {
      scannedData = decodedText;
    } else {
      try {
        scannedData = JSON.parse(decodedText);
      } catch {
        return;
      }
    }
    scannedData = camelizeKeys(scannedData);
    if (!validateEventData(scannedData) && !parseQRCodeParticipantData(scannedData)) {
      const parsedData = await parseCustomQRCodeData(decodedText, errorModal, customQRCodes);
      if (!parsedData) {
        return;
      }
    }
    await qrCodeSuccessCallback(decodedText, null);
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (scannedStringRef.current?.length > 3) {
        setProcessing(true);
      }
      if (e.key !== 'Enter' && e.key !== 'Tab' && e.key.length === 1) {
        scannedStringRef.current += e.key;
      } else if (scannedStringRef.current !== '' && (e.key === 'Enter' || e.key === 'Tab')) {
        currentKeyRef.current = e.key;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const currentScannedString = scannedStringRef.current;
      timeoutRef.current = setTimeout(async () => {
        if (currentKeyRef.current === 'Enter' || currentKeyRef.current === 'Tab') {
          currentKeyRef.current = '';
          await handleScan(scannedStringRef.current);
          scannedStringRef.current = '';
          setProcessing(false);
        }
        if (currentScannedString === scannedStringRef.current) {
          setProcessing(false);
          scannedStringRef.current = '';
        }
      }, 100);
    },
    [setProcessing, handleScan]
  );

  useEffect(() => {
    if (qrCodeInputRef.current) {
      qrCodeInputRef.current.focus();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <div>{!processing && <input ref={qrCodeInputRef} hidden />}</div>;
}
