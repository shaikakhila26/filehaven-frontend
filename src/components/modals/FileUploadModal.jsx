// FileUploadModal.jsx
import { useRef, useState,useEffect } from "react";
import { useFolder } from "../../context/FolderContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";


const FileUploadModal = ({ onClose , folderId , onUploaded }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const inputRef = useRef();
  const [previewFile, setPreviewFile] = useState(null);
const [previewUrl, setPreviewUrl] = useState(null);
const [textPreview, setTextPreview] = useState("");

    const { currentFolderId, setCurrentFolderId } = useFolder();
  const handleFile = async (file) => {
    setStatus("");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

   if (folderId && folderId !== "root") {
  formData.append("folder_id", folderId);
}


    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${VITE_API_URL}/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round(e.loaded / e.total * 100));
      }
    };

    xhr.onload = () => {
      let apiRes = {};
      try {
        apiRes = JSON.parse(xhr.responseText);
      } catch {
        apiRes = {};
      }

      if ((xhr.status === 200 || xhr.status === 201) && apiRes.success) {
        setStatus(apiRes.message || "Success!");
        // Notify parent about upload so file list can refresh
        if (onUploaded) onUploaded();
        setTimeout(onClose, 1200);
      } else {
        const msg = apiRes.message || xhr.responseText || "Upload failed!";
        setStatus("Error: " + msg);
      }
    };
    xhr.onerror = () => {
      setStatus("Failed to upload!");
    };

    xhr.send(formData);
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
  if (e.target.files.length) {
    const file = e.target.files[0];
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    // For text files, read text content
    if (file.type.startsWith("text/") || file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = () => setTextPreview(reader.result.slice(0, 2000)); // Limit size to 2k chars
      reader.readAsText(file);
    } else {
      setTextPreview(""); // clear for non-text files
    }
    handleFile(file); // if you want to trigger upload after selection
  }
};
useEffect(() => {
  return () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };
}, [previewUrl]);



  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow p-4 max-w-xs w-full">
        <h2 className="text-xl font-bold mb-2">Upload File</h2>
        <div
          className="border-2 border-dashed rounded p-4 mb-4 text-center text-gray-500"
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
        >
          Drag & drop file here or{" "}
          <input type="file" ref={inputRef} onChange={onFileChange} className="mt-2 block w-full"/>
          {previewFile && (
  <div className="mb-4 max-h-[40vh] overflow-y-auto">
    <div className="font-semibold">Preview:</div>
    {previewFile.type.startsWith("image/") ? (
      <img src={previewUrl} alt="preview" className="max-h-48 max-w-full mt-2" />
    ) : previewFile.type === "application/pdf" ? (
      <iframe
        src={previewUrl}
        title="PDF Preview"
        className="w-full h-[30vh] mt-2"
        style={{ border: 0 }}
      />
    ) : previewFile.type.startsWith("text/") || previewFile.type === "application/json" ? (
      <pre className="bg-gray-100 p-2 rounded max-h-[30vh] overflow-auto mt-2">{textPreview}</pre>
    ) : (
      <div className="mt-2 text-gray-500 italic">No preview available for this file type.</div>
    )}
  </div>
)}

        </div>
        <div className="mb-2">
          {progress > 0 && <div>Progress: {progress}%</div>}
          {status && <div className={status === "Success!" ? "text-green-600" : "text-red-600"}>{status}</div>}
        </div>
        <button className="bg-gray-300 px-3 py-1 rounded w-full" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
export default FileUploadModal;
