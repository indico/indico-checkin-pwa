import {useContext} from 'react';
import {CheckTypeContext} from '../context/CheckTypeProvider';

/**
 * A hook to access the CheckTypeContext. It is just a shorthand for useContext(CheckTypeContext).
 * @returns {Object} The CheckTypeContext object
 */
const useCheckTypes = () => {
  return useContext(CheckTypeContext);
};

export default useCheckTypes;
