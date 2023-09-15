import {createPortal} from 'react-dom';
import {XMarkIcon} from '@heroicons/react/20/solid';
import {ExclamationCircleIcon} from '@heroicons/react/24/outline';
import {ConfirmModalData, ErrorModalData} from '../../../context/ModalContextProvider';
import {useModalData} from '../../../hooks/useModal';
import Button, {DangerButton, OutlineButton} from '../Button';
import Typography from '../Typography';

export default function Modal() {
  const {isOpen, data, closeModal} = useModalData();
  const {type, ...rest} = data;

  if (!isOpen) {
    return null;
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      onClick={closeModal}
    >
      <div
        className="relative mx-4 flex w-full flex-col rounded rounded-lg
                   bg-white px-4 pb-4 pt-10 shadow-2xl dark:bg-gray-800"
        onClick={e => e.stopPropagation()}
      >
        {type === 'error' && (
          <ErrorModal {...(rest as Omit<ErrorModalData, 'type'>)} closeModal={closeModal} />
        )}
        {type === 'confirm' && (
          <ConfirmModal {...(rest as Omit<ConfirmModalData, 'type'>)} closeModal={closeModal} />
        )}
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}

interface ErrorModalProps extends Omit<ErrorModalData, 'type'> {
  closeModal: () => void;
}

const ErrorModal = ({title, content, closeBtnText, closeModal}: ErrorModalProps) => {
  return (
    <>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-dangerDark">
        <ExclamationCircleIcon className="w-12 min-w-[3rem] p-1 text-white" />
      </div>
      <Typography variant="h3" className="text-center">
        {title}
      </Typography>
      <Typography variant="body1" className="mt-4 text-center">
        {content}
      </Typography>
      <div className="flex justify-center pt-8">
        <Button
          className="min-w-[5rem] justify-center font-bold shadow-lg outline-none"
          onClick={closeModal}
        >
          {closeBtnText}
        </Button>
      </div>
    </>
  );
};

interface ConfirmModalProps extends Omit<ConfirmModalData, 'type'> {
  closeModal: () => void;
}

const ConfirmModal = ({
  title,
  content,
  confirmBtnText,
  closeBtnText,
  closeModal,
  onConfirm,
}: ConfirmModalProps) => {
  return (
    <>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-dangerDark">
        <XMarkIcon className="w-12 min-w-[3rem] p-1 text-white" />
      </div>
      <Typography variant="h3" className="text-center">
        {title}
      </Typography>
      <Typography variant="body1" className="mt-4 text-center">
        {content}
      </Typography>
      <div className="flex justify-end gap-2 pt-8">
        <OutlineButton onClick={closeModal}>{closeBtnText}</OutlineButton>
        <DangerButton
          onClick={() => {
            closeModal();
            onConfirm();
          }}
        >
          {confirmBtnText}
        </DangerButton>
      </div>
    </>
  );
};
