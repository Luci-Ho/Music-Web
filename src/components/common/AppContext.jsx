import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);

  return (
    <AppContext.Provider value={{ currentSong, setCurrentSong }}>
      {children}
    </AppContext.Provider>
  );
};
