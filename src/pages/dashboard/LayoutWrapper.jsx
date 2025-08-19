import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Outlet } from "react-router-dom";
import MyDrive from "./MyDrive";
import NewFolderModal from "../../components/modals/NewFolderModal";
import FileUploadModal from "../../components/modals/FileUploadModal";
import FolderUploadModal from "../../components/modals/FolderUploadModal";
import { useFolder } from "../../context/FolderContext";



const LayoutWrapper = () => {
  const [storage, setStorage] = useState({ used: 0, total: 1024 * 1024 * 500 }); // default 500MB
  const [showNewFolder, setShowNewFolder] = useState(false);
const [showFileUpload, setShowFileUpload] = useState(false);
const [showFolderUpload, setShowFolderUpload] = useState(false);
const {currentFolderId, setCurrentFolderId }= useFolder();


  useEffect(() => {
    fetch("http://localhost:8080/api/storage", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setStorage(data))
      .catch((err) => console.error("Storage fetch error:", err));
  }, []);

  const handleNewClick = (type) => {
    if (type === "folder") {
     setShowNewFolder(true);
    } else if (type === "file") {
      setShowFileUpload(true);
    } else if (type === "folderUpload") {
      setShowFolderUpload(true);
    }
  };

  return (
    <Layout onNewClick={handleNewClick} storage={storage}>
      <Outlet />

      
    {/* Add your modals here */}
    {showNewFolder && (
      <NewFolderModal
      parentId={currentFolderId} // Pass current folder ID to modal
        onClose={() => setShowNewFolder(false)}
        onSuccess={() => {
          setShowNewFolder(false);
          // Refresh file list and/or storage info if needed
        }}
      />
    )}
    {showFileUpload && (
      <FileUploadModal
      folderId={currentFolderId}
        onClose={() => setShowFileUpload(false)}
        onSuccess={() => {
          setShowFileUpload(false);
          // Refresh file list and/or storage info if needed
        }}
      />
    )}
    {showFolderUpload && (
      <FolderUploadModal
      folderId={currentFolderId}
        onClose={() => setShowFolderUpload(false)}
        onSuccess={() => {
          setShowFolderUpload(false);
          // Refresh file list and/or storage info if needed
        }}
      />
    )}
    
    </Layout>
  );
};

export default LayoutWrapper;
