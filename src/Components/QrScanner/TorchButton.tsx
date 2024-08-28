import {MutableRefObject, useState, useEffect} from 'react';
import {BoltIcon, BoltSlashIcon, ExclamationCircleIcon} from '@heroicons/react/24/solid';
import {Html5Qrcode} from 'html5-qrcode';
import PropTypes from 'prop-types';
import {useLogError} from '../../hooks/useError';

interface TorchButtonProps {
  html5CustomScanner: MutableRefObject<Html5Qrcode | null>;
  canUseCamera: boolean;
}

export function TorchButton({html5CustomScanner, canUseCamera}: TorchButtonProps) {
  const [torchOn, setTorchOn] = useState(false);
  const [torchUnavailable, setTorchUnavailable] = useState(false);
  const logError = useLogError();

  useEffect(() => {
    const toggleTorch = async () => {
      try {
        const track = html5CustomScanner?.current?.getRunningTrackCameraCapabilities();
        if (track && track.torchFeature().isSupported()) {
          await track.torchFeature().apply(torchOn);
        } else if (track && !track.torchFeature().isSupported()) {
          setTorchUnavailable(true);
          console.warn('Torch feature is not supported on this device.');
        }
      } catch (e) {
        setTorchUnavailable(true);
        console.warn('Failed to toggle torch:', error);
        logError(`Failed to toggle torch: ${error}`);
      }
    };

    toggleTorch();
  }, [torchOn, html5CustomScanner, logError]);

  if (!canUseCamera) {
    return;
  }

  if (torchUnavailable) {
    return (
      <div className="fit-content flex justify-center gap-1 bg-yellow-500 py-3 text-center text-amber-900">
        <span className="flex items-center">
          <ExclamationCircleIcon className="mr-1 h-6 w-6" />
          Your device's torch is unavailable
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => setTorchOn(prev => !prev)}
      className="fit-content flex justify-center gap-1 bg-primary py-3 text-center text-white active:bg-blue-800 dark:bg-blue-600 dark:active:bg-blue-700"
    >
      <span className="flex items-center">
        {torchOn ? (
          <>
            <BoltSlashIcon className="mr-1 h-6 w-6" />
            Turn torch off
          </>
        ) : (
          <>
            <BoltIcon className="mr-1 h-6 w-6" />
            Turn torch on
          </>
        )}
      </span>
    </div>
  );
}

TorchButton.propTypes = {
  html5CustomScanner: PropTypes.object.isRequired,
  canUseCamera: PropTypes.bool.isRequired,
};
