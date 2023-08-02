import {createContext, useState} from 'react';
import PropTypes from 'prop-types';

// Modal data
interface ModalProps {
  title: string;
  body: string;
  btnText: string;
}
const defaultTitle = 'An error occurred';
const defaultBody = 'Something went wrong. Please try again later.';
const defaultBtnText = 'OK';
const emptyModalData = {
  title: defaultTitle,
  body: defaultBody,
  btnText: defaultBtnText,
};

const AppStateContext = createContext({
  showModal: false,
  modalData: emptyModalData,
  enableModal: (_modalData: ModalProps) => {},
  disableModal: () => {},
});

interface AppStateProviderProps {
  children: React.ReactNode;
}
export interface AppStateReturn {
  showModal: boolean;
  modalData: ModalProps;
  enableModal: (modalData: ModalProps) => void;
  disableModal: () => void;
}

export const AppStateProvider = ({children}: AppStateProviderProps) => {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ModalProps>(emptyModalData);

  /**
   * Sets the modal data and shows the modal
   * @param modalData - The data to be displayed in the modal
   */
  const enableModal = (modalData: ModalProps) => {
    setModalData(modalData);
    setShowModal(true);
  };
  /**
   * Hides the modal and resets the modal data
   */
  const disableModal = () => {
    setShowModal(false);
    setModalData(emptyModalData);
  };

  return (
    <AppStateContext.Provider value={{showModal, modalData, enableModal, disableModal}}>
      {children}
    </AppStateContext.Provider>
  );
};

AppStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppStateContext;
