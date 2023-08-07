import {useContext} from 'react';
import AppStateContext, {AppStateReturn} from '../context/AppStateProvider';

/**
 * A hook to access the AppStateContext. It is just a shorthand for useContext(AppStateContext).
 * @returns {Object} The AppStateContext object
 */
const useAppState = (): AppStateReturn => {
  return useContext(AppStateContext);
};

export default useAppState;
