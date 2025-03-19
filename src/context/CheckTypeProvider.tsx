import {ReactNode, createContext, useState} from 'react';

interface CheckType {
  id: number;
  title: string;
}

export interface EventCheckTypesMap {
  [key: number]: CheckType;
}

interface CheckTypeContextProps {
  checkTypes: EventCheckTypesMap;
  setCheckTypes: (v: EventCheckTypesMap) => void;
}

export const CheckTypeContext = createContext<CheckTypeContextProps>({
  checkTypes: {},
  setCheckTypes: () => {},
});

export const CheckTypeProvider = ({children}: {children: ReactNode}) => {
  const storedCheckTypes = JSON.parse(localStorage.getItem('checkTypes') || '{}');
  const [checkTypes, setCheckTypes] = useState(storedCheckTypes);

  return (
    <CheckTypeContext.Provider
      value={{
        checkTypes,
        setCheckTypes,
      }}
    >
      {children}
    </CheckTypeContext.Provider>
  );
};
