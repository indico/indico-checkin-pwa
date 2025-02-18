import {ReactNode, createContext, useCallback, useState} from 'react';

export interface ErrorModalData {
  type: 'error';
  title: string;
  content: string;
  closeBtnText: string;
}

interface ErrorModalParams {
  title: string;
  content?: string;
  closeBtnText?: string;
}

interface ErrorModalOptions {
  title: string;
  content: string;
  autoClose?: boolean;
}

export type ErrorModalFunction = (options: ErrorModalOptions) => void;

export interface ConfirmModalData {
  type: 'confirm';
  title: string;
  content: string;
  closeBtnText: string;
  confirmBtnText: string;
  onConfirm: () => void;
}

interface ConfirmModalParams {
  title: string;
  content?: string;
  closeBtnText?: string;
  confirmBtnText?: string;
  onConfirm: () => void;
}

type ModalData = ErrorModalData | ConfirmModalData;

interface ModalContextProps {
  isOpen: boolean;
  data: ModalData;
  closeModal: () => void;
}

const defaultModalData: ErrorModalData = {
  type: 'error',
  title: '',
  content: '',
  closeBtnText: 'Close',
};

export const ModalDataContext = createContext<ModalContextProps>({
  isOpen: false,
  data: defaultModalData,
  closeModal: () => {},
});

export const ErrorModalContext = createContext((_data: ErrorModalParams) => {});
export const ConfirmModalContext = createContext((_data: ConfirmModalParams) => {});

export const ModalContextProvider = ({children}: {children: ReactNode}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ModalData>(defaultModalData);

  const showErrorModal = useCallback(
    ({title, content, autoClose}: ErrorModalOptions) => {
      setData({
        type: 'error',
        title,
        content,
        closeBtnText: 'Close',
      });
      setIsOpen(true);

      if (autoClose) {
        setTimeout(() => {
          setIsOpen(false);
        }, 2000);
      }
    },
    [setData, setIsOpen]
  );

  const confirmModal = useCallback(
    ({
      title,
      content = '',
      closeBtnText = 'Cancel',
      confirmBtnText = 'Confirm',
      onConfirm,
    }: ConfirmModalParams) => {
      setData({
        type: 'confirm',
        title,
        content,
        closeBtnText,
        confirmBtnText,
        onConfirm,
      });
      setIsOpen(true);
    },
    [setData, setIsOpen]
  );

  const closeModal = () => setIsOpen(false);

  return (
    <ModalDataContext.Provider value={{isOpen, data, closeModal}}>
      <ErrorModalContext.Provider value={showErrorModal}>
        <ConfirmModalContext.Provider value={confirmModal}>{children}</ConfirmModalContext.Provider>
      </ErrorModalContext.Provider>
    </ModalDataContext.Provider>
  );
};
