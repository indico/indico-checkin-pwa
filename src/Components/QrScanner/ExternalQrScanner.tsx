import {useEffect, useRef, useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useHandleError, useLogError} from '../../hooks/useError';
import {useErrorModal, useModalData} from '../../hooks/useModal';
import useSettings from '../../hooks/useSettings';
import {processCode} from '../../pages/scan/scan';
import {useIsOffline} from '../../utils/client';
import LoadingBanner from '../Tailwind/LoadingBanner';
import TopNav from '../TopNav';

export default function ExternalQrScanner() {
  const scannedStringRef = useRef('');
  const currentKeyRef = useRef('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [processing, setProcessing] = useState(false);
  const errorModal = useErrorModal();
  const handleError = useHandleError();
  const logError = useLogError();
  const offline = useIsOffline();
  const navigate = useNavigate();
  const {closeModal} = useModalData();
  const {autoCheckin} = useSettings();

  const onScanResult = async (decodedText: string) => {
    try {
      closeModal();
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
        false
      );
    } catch (e) {
      handleError(e, 'Error processing QR code');
    } finally {
      setProcessing(false);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.stopPropagation();
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
          await onScanResult(scannedStringRef.current);
          scannedStringRef.current = '';
          setProcessing(false);
        }
        if (currentScannedString === scannedStringRef.current) {
          setProcessing(false);
          scannedStringRef.current = '';
        }
      }, 100);
    },
    [setProcessing, onScanResult]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [autoCheckin]);

  return (
    <>
      {true && (
        <div className="fixed inset-0 z-50 bg-gray-100 dark:bg-gray-800">
          <TopNav
            backBtnText="Cancel"
            backNavigateTo="/"
            onBackBtnClick={() => setProcessing(false)}
          />
          <div className="flex items-center justify-center">
            <LoadingBanner text="Scanning..." />
          </div>
        </div>
      )}
    </>
  );
}
