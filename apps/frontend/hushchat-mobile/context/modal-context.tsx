import AppModal, { ModalProps } from '@/components/Modal';
import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

type ModalConfig = Omit<ModalProps, 'visible' | 'onClose'>;

interface ModalContextValue {
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
});

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  const openModal = useCallback((config: ModalConfig) => {
    setModalConfig(config);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setModalConfig(null);
  }, []);

  const contextValue = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {modalVisible && modalConfig && (
        <AppModal visible={modalVisible} onClose={closeModal} {...modalConfig} />
      )}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => useContext(ModalContext);
