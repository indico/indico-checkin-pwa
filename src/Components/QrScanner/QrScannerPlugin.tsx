// file = QrScannerPlugin.jsx
import {MutableRefObject, useEffect, useRef} from 'react';
import {Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats} from 'html5-qrcode';
import {checkCameraPermissions} from '../../utils/media';
import classes from './QrScanner.module.css';

// Id of the HTML element used by the Html5QrcodeScanner.
const qrcodeRegionId = 'html5qr-code-full-region';

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

interface QrProps {
  fps?: number; // Expected frame rate of qr code scanning. example { fps: 2 } means the scanning would be done every 500 ms.
  qrbox?: number;
  disableFlip?: boolean;
  qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void;
  qrCodeErrorCallback?: (errorMessage: string, error: any) => void;
  formatsToSupport?: Html5QrcodeSupportedFormats[];
  onPermRefused: () => void;
}

const QrScannerPlugin = ({
  fps = 10,
  qrbox = 250,
  disableFlip = false,
  formatsToSupport = [Html5QrcodeSupportedFormats.QR_CODE],
  qrCodeSuccessCallback,
  qrCodeErrorCallback,
  onPermRefused,
}: QrProps) => {
  const aspectRatio = calcAspectRatio();
  const html5CustomScanner: MutableRefObject<Html5Qrcode | null> = useRef(null);

  useEffect(() => {
    const showQRCode = async () => {
      const hasCamPerm: boolean = await checkCameraPermissions();
      if (!hasCamPerm) {
        onPermRefused();
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
  ]);

  return (
    <div className={classes.wrapper}>
      <ShadedRegion size={qrbox} />
      <div id={qrcodeRegionId} />
    </div>
  );
};

export default QrScannerPlugin;

function ShadedRegion({size}: {size: number}) {
  return <div className={classes['shaded-region']} style={{width: size, height: size}}></div>;
}
