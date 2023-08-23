import {createPortal} from 'react-dom';
import {ExclamationCircleIcon} from '@heroicons/react/24/outline';
import useAppState from '../../../hooks/useAppState';
import Button from '../Button';
import Typography from '../Typography';

const Modal = () => {
  const {showModal, modalData, disableModal} = useAppState();

  return (
    showModal &&
    createPortal(
      <div
        className="fixed flex justify-center items-center inset-0 z-50 bg-black bg-opacity-70"
        onClick={disableModal}
      >
        <div
          className="mx-4 rounded-lg shadow-2xl relative flex flex-col bg-white dark:bg-gray-700 rounded pt-10 pb-4 px-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dangerDark rounded-full">
            <ExclamationCircleIcon className="p-1 w-12 min-w-[3rem] text-white" />
          </div>
          <Typography variant="h3">{modalData.title}</Typography>
          <Typography variant="body1" className="mt-4">
            {modalData.body}
          </Typography>
          <div className="flex justify-center pt-8">
            <Button
              className="font-bold shadow-lg outline-none min-w-[5rem] justify-center"
              onClick={disableModal}
            >
              {modalData.btnText}
            </Button>
          </div>
        </div>
      </div>,
      document.body
    )
  );
};

export default Modal;
