import useAppState from '../../../hooks/useAppState';
import Button from '../Button';
import Typography from '../Typography';

const Modal = () => {
  const {showModal, modalData, disableModal} = useAppState();

  const stopPropagation = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    showModal && (
      <div
        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-40"
        onClick={disableModal}
      >
        <div className="relative w-auto my-6 mx-5 max-w-3xl">
          {/*content*/}
          <div
            className="border-0 rounded-lg shadow-2xl relative flex flex-col w-full bg-white outline-none focus:outline-none"
            onClick={stopPropagation}
          >
            {/*header*/}
            <div className="flex items-start justify-between p-4 border-b border-solid border-slate-200 rounded-t">
              <Typography variant="h3" className="font-semibold text-black dark:text-black">
                {modalData.title}
              </Typography>
            </div>

            {/*body*/}
            <div className="relative p-4 flex-auto">
              <Typography
                variant="body1"
                className="my-4 text-slate-600 dark:text-slate-600 leading-normal"
              >
                {modalData.body}
              </Typography>
            </div>

            {/*footer*/}
            <div className="flex items-center justify-end p-4 border-t border-solid border-slate-200 rounded-b">
              <Button
                className="font-bold uppercase shadow-lg outline-none min-w-[5rem]"
                onClick={disableModal}
              >
                {modalData.btnText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
