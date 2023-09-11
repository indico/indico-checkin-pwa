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
      className="fixed flex justify-center items-center inset-0 z-50 bg-black bg-opacity-70"
      onClick={closeModal}
    >
      <div
        className="mx-4 w-full rounded-lg shadow-2xl relative flex flex-col bg-white dark:bg-gray-800 rounded pt-10 pb-4 px-4"
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dangerDark rounded-full">
        <ExclamationCircleIcon className="p-1 w-12 min-w-[3rem] text-white" />
      </div>
      <Typography variant="h3" className="text-center">
        {title}
      </Typography>
      <Typography variant="body1" className="mt-4 text-center">
        {content}
      </Typography>
      <div className="flex justify-center pt-8">
        <Button
          className="font-bold shadow-lg outline-none min-w-[5rem] justify-center"
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dangerDark rounded-full">
        <XMarkIcon className="p-1 w-12 min-w-[3rem] text-white" />
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
