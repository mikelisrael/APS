"use client";

import React, { PropsWithChildren, useContext } from "react";

interface IAppContext {}

const AppContext = React.createContext<IAppContext | undefined>(undefined);

export const ContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};

export const useGlobalContext = (): IAppContext => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within an AppProvider");
  }
  return context;
};
