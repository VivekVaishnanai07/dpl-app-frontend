import { ReactNode } from "react";
import React, { createContext, useState, useContext } from "react";

const SnackbarContext = createContext({
  snackbar: { message: "", visible: false },
  showSnackbar: (message: string) => { }
});


export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbar, setSnackbar] = useState({ message: "", visible: false });

  const showSnackbar = (message: string) => {
    setSnackbar({ message, visible: true });
    setTimeout(() => setSnackbar({ message: "", visible: false }), 3000); // Auto-hide after 3 sec
  };

  return (
    <SnackbarContext.Provider value={{ snackbar, showSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
