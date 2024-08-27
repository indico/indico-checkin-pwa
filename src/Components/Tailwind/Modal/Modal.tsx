import {createPortal} from 'react-dom';
import {ExclamationCircleIcon, TrashIcon} from '@heroicons/react/24/outline';
import {ConfirmModalData, ErrorModalData} from '../../../context/ModalContextProvider';
import {useModalData} from '../../../hooks/useModal';
import {DangerButton, OutlineButton} from '../Button';
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
      <div onClick={e => e.stopPropagation()}>
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
    <div className="relative mx-4 flex flex-col shadow-2xl">
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 dark:bg-dangerDark">
        <ExclamationCircleIcon className="w-12 min-w-[3rem] p-1 text-white" />
      </div>
      <div
        className={`flex flex-col gap-6 overflow-hidden rounded rounded-md border-t-[6px] border-t-red-500
                    bg-white pt-10 dark:border-t-red-700 dark:bg-gray-800`}
      >
        <div className="flex flex-col gap-2 px-4">
          <Typography variant="h3" className="text-center">
            {title}
          </Typography>
          <Typography variant="body1" className="mt-4 text-center">
            {content}
          </Typography>
        </div>
        <div className="flex justify-end gap-3 bg-gray-100 px-4 pb-4 pt-4 dark:bg-gray-700">
          <OutlineButton className="min-w-[5rem]" onClick={closeModal}>
            {closeBtnText}
          </OutlineButton>
        </div>
      </div>
    </div>
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
    <div className="relative mx-4 flex flex-col shadow-2xl">
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 dark:bg-dangerDark">
        <TrashIcon className="w-12 min-w-[2rem] p-2 text-white" />
      </div>
      <div
        className={`flex flex-col gap-6 overflow-hidden rounded rounded-md border-t-[6px] border-t-red-500
                    bg-white pt-10 dark:border-t-red-700 dark:bg-gray-800`}
      >
        <div className="flex flex-col gap-2 px-4">
          <Typography variant="h3" className="text-center">
            {title}
          </Typography>
          <Typography variant="body1" className="mt-4 text-center">
            {content}
          </Typography>
        </div>
        <div className="flex justify-end gap-3 bg-gray-100 px-4 pb-4 pt-4 dark:bg-gray-700">
          <OutlineButton className="min-w-[5rem]" onClick={closeModal}>
            {closeBtnText}
          </OutlineButton>
          <DangerButton
            className="min-w-[5rem]"
            onClick={() => {
              closeModal();
              onConfirm();
            }}
          >
            {confirmBtnText}
          </DangerButton>
        </div>
      </div>
    </div>
  );
};
