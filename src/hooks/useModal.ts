import {useContext} from 'react';
import {
  ConfirmModalContext,
  ErrorModalContext,
  ModalDataContext,
} from '../context/ModalContextProvider';

export const useModalData = () => {
  return useContext(ModalDataContext);
};

export const useErrorModal = () => {
  return useContext(ErrorModalContext);
};

export const useConfirmModal = () => {
  return useContext(ConfirmModalContext);
};
