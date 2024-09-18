"use client";

import { IAppContext, IUser } from "@/types";
import React, { PropsWithChildren, useContext, useState } from "react";

const AppContext = React.createContext<IAppContext | undefined>(undefined);

export const ContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// custom hook
export const useGlobalContext = (): IAppContext => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within an AppProvider");
  }
  return context;
};
