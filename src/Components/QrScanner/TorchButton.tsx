import {MutableRefObject, useState, useEffect} from 'react';
import {BoltIcon, BoltSlashIcon} from '@heroicons/react/24/solid';
import {Html5Qrcode} from 'html5-qrcode';
import PropTypes from 'prop-types';

interface TorchButtonProps {
  html5CustomScanner: MutableRefObject<Html5Qrcode | null>;
}

export function TorchButton({html5CustomScanner}: TorchButtonProps) {
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    const toggleTorch = async () => {
      try {
        const track = html5CustomScanner?.current?.getRunningTrackCameraCapabilities();
        if (track && track.torchFeature().isSupported()) {
          await track.torchFeature().apply(torchOn);
        }
      } catch (error) {
        console.warn('Failed to toggle torch:', error);
      }
    };

    toggleTorch();
  }, [torchOn, html5CustomScanner]);

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
};
