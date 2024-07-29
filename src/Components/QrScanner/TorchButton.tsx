import {MutableRefObject, useState, useEffect} from 'react';
import {BoltIcon, BoltSlashIcon, ExclamationCircleIcon} from '@heroicons/react/24/solid';
import {Html5Qrcode} from 'html5-qrcode';
import PropTypes from 'prop-types';

interface TorchButtonProps {
  html5CustomScanner: MutableRefObject<Html5Qrcode | null>;
  canUseCamera: boolean;
}

export function TorchButton({html5CustomScanner, canUseCamera}: TorchButtonProps) {
  const [torchOn, setTorchOn] = useState(false);
  const [torchUnavailable, setTorchUnavailable] = useState(false);

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
      } catch (error) {
        setTorchUnavailable(true);
        console.warn('Failed to toggle torch:', error);
      }
    };

    toggleTorch();
  }, [torchOn, html5CustomScanner]);

  if (!canUseCamera) {
    return null;
  }

  if (torchUnavailable) {
    return (
      <>
        <div className="fit-content flex justify-center gap-1 bg-yellow-500 py-3 text-center text-amber-900">
          <span className="flex items-center">
            <ExclamationCircleIcon className="mr-1 h-6 w-6" />
            Your device's torch is unavailable
          </span>
        </div>
        <div className="mt-4 flex justify-center">
          <div className="inline-flex cursor-not-allowed rounded-full bg-gray-200 text-gray-500">
            <BoltSlashIcon className="mx-2 my-2 h-16 w-16" />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="mt-4 flex justify-center">
      <div
        onClick={() => setTorchOn(prev => !prev)}
        className="inline-flex cursor-pointer rounded-full bg-primary text-white"
      >
        {torchOn ? (
          <BoltIcon className="mx-2 my-2 h-16 w-16" />
        ) : (
          <BoltSlashIcon className="mx-2 my-2 h-16 w-16" />
        )}
      </div>
    </div>
  );
}

TorchButton.propTypes = {
  html5CustomScanner: PropTypes.object.isRequired,
  canUseCamera: PropTypes.bool.isRequired,
};
