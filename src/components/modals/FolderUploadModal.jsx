import { useState, useRef } from "react";
import { useFolder } from "../../context/FolderContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";


const FolderUploadModal = ({ onClose, onSuccess ,folderId}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { currentFolderId, setCurrentFolderId } = useFolder();

  const inputRef = useRef();

  // Upload a single file with fetch and formData, returns promise
  async function uploadFile(file, relativePath , folderId) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("relativePath", relativePath); // optional, send path for folder mapping


// When appending folder_id to FormData
if (folderId && folderId !== "root" && folderId !== "null") {
  formData.append("folder_id", folderId);
} else {
  formData.append("folder_id", null); // <-- ensure backend receives something
}


   

    const response = await fetch(`${VITE_API_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(`Upload failed for ${file.name}: ${msg}`);
    }
  }

  async function handleFilesUpload(files) {
    setUploading(true);
    setError("");
    setProgress(0);
    setSuccess(false);

    try {
      // files is a FileList but convert to array for easier handling
      const filesArray = Array.from(files);
      const totalFiles = filesArray.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = filesArray[i];
        // Use webkitRelativePath or fallback to file.name
        const relativePath = file.webkitRelativePath || file.name;

        await uploadFile(file, relativePath,folderId);

        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  }

  const onInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFilesUpload(e.target.files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow p-4  max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Upload Folder</h2>

        <input
          ref={inputRef}
          type="file"
          webkitdirectory="true"
          directory="true"
          multiple
          className="mb-4 w-full"
          onChange={onInputChange}
        />

        {uploading && (
          <div className="mb-2">
            Uploading... {progress}%
            <div className="w-full bg-gray-200 rounded h-2 mt-1">
              <div
                className="bg-blue-500 h-2 rounded transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">Folder uploaded successfully!</div>}

        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            disabled={uploading}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderUploadModal;
