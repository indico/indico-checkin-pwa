import {createContext, useState} from 'react';
import PropTypes from 'prop-types';

const SettingsContext = createContext({});

export const SettingsProvider = ({children}) => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SettingsContext.Provider value={{darkMode, setDarkMode}}>{children}</SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SettingsContext;
