// src/context/FolderContext.jsx
import React, { createContext, useContext, useState } from "react";

const FolderContext = createContext();

export const FolderProvider = ({ children }) => {
  const [currentFolderId, setCurrentFolderId] = useState("root");

  return (
    <FolderContext.Provider value={{ currentFolderId, setCurrentFolderId }}>
      {children}
    </FolderContext.Provider>
  );
};

export const useFolder = () => useContext(FolderContext);
