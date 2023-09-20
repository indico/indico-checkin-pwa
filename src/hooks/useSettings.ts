import {useContext} from 'react';
import {SettingsContext} from '../context/SettingsProvider';

/**
 * A hook to access the SettingsContext. It is just a shorthand for useContext(SettingsContext).
 * @returns {Object} The SettingsContext object
 */
const useSettings = () => {
  return useContext(SettingsContext);
};

export default useSettings;
