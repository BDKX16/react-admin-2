import React, { createContext, useContext, useState, ReactNode } from "react";

interface WelcomeModalContextType {
  showWelcomeModal: boolean;
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;
  setShowWelcomeModal: (show: boolean) => void;
}

const WelcomeModalContext = createContext<WelcomeModalContextType | undefined>(
  undefined
);

export const WelcomeModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const openWelcomeModal = () => setShowWelcomeModal(true);
  const closeWelcomeModal = () => setShowWelcomeModal(false);

  return (
    <WelcomeModalContext.Provider
      value={{
        showWelcomeModal,
        openWelcomeModal,
        closeWelcomeModal,
        setShowWelcomeModal,
      }}
    >
      {children}
    </WelcomeModalContext.Provider>
  );
};

export const useWelcomeModalContext = () => {
  const context = useContext(WelcomeModalContext);
  if (context === undefined) {
    throw new Error(
      "useWelcomeModalContext must be used within a WelcomeModalProvider"
    );
  }
  return context;
};
