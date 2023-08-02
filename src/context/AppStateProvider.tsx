import {createContext, useState} from 'react';
import PropTypes from 'prop-types';

const AppStateContext = createContext({
  showModal: false,
  setShowModal: (_bool: boolean) => {},
});

interface AppStateProviderProps {
  children: React.ReactNode;
}
export interface AppStateReturn {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}

export const AppStateProvider = ({children}: AppStateProviderProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <AppStateContext.Provider value={{showModal, setShowModal}}>
      {children}
    </AppStateContext.Provider>
  );
};

AppStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppStateContext;
