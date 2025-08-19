import { useEffect, useState } from "react";
import { useFolder } from "../../context/FolderContext";
import ShareFileModal from "../../components/modals/ShareFileModal"; // adjust the path as needed
import FileListWithContextMenu from "../../context/FileListWithContextMenu";
import FileVersionList from "../../components/FileVersionList"; // adjust path accordingly


const API_BASE = "http://localhost:8080/api";

const MyDrive = ({onFolderChange}) => {
  const [files, setFiles] = useState([]);
  const [showVersionsFor, setShowVersionsFor] = useState(null); // File object or null


  const { setCurrentFolderId } = useFolder();
  
  const [breadcrumbs, setBreadcrumbs] = useState([
    { id: "root", name: "My Drive", type: "folder" },
  ]);
  const currentFolder = breadcrumbs[breadcrumbs.length - 1];

  // Preview modal state
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showShareFor, setShowShareFor] = useState(null); // The file object (or null)


  // Fetch contents of a folder
  const fetchFolderContents = async (folderId) => {
    try {
      const url =
        !folderId || folderId === "root"
          ? `${API_BASE}/folder-contents`
          : `${API_BASE}/folder-contents?folderId=${folderId}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await res.json();

      // Normalize folder/file objects
      const normalized = [
        ...(data.folders || []).map((f) => ({ ...f, type: "folder" })),
        ...(data.files || []).map((f) => ({ ...f, type: "file" })),
      ];

      setFiles(normalized);
    } catch (err) {
      console.error("Error fetching folder contents:", err);
    }
  };

  // Initial load (root folder)
  useEffect(() => {
    fetchFolderContents("root");
  }, []);

  // Handle folder click → go deeper
  const openFolder = (folder) => {
    if (folder.type !== "folder") return;
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name, type: "folder" }]);
    fetchFolderContents(folder.id);
    setCurrentFolderId(folder.id); 
    onFolderChange?.(folder.id);  // Notify parent of folder change
  };

  // Handle breadcrumb click → go back
  const goToFolder = (index) => {
    const newPath = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newPath);
    fetchFolderContents(newPath[newPath.length - 1].id);
     setCurrentFolderId(newPath[newPath.length - 1].id); // <-- This must be UUID or "root"
    onFolderChange?.(newPath[newPath.length - 1].id);  // Notify parent
  };

  // Handle file click (preview or open)
  const handleFileClick = async (file) => {
    if (file.type === "folder") {
      openFolder(file);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/files/${file.id}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error("Failed to fetch file");

      const data = await res.json();

      if (data.url) {
        if (file.mime_type?.startsWith("image/")) {
          setPreviewFile(file);
          setPreviewUrl(data.url);
        } else {
          window.open(data.url, "_blank");
        }
      } else {
        console.error("Unexpected response:", data);
      }
    } catch (err) {
      console.error("Error opening file:", err);
    }
  };

  // Handle download
  // Handle download (works for both modal & table)
const handleDownload = async (file) => {
  try {
    const res = await fetch(`${API_BASE}/files/${file.id}/download`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const data = await res.json();

    if (data.url) {
      // Fetch the actual blob
      const blobRes = await fetch(data.url);
      const blob = await blobRes.blob();

      // Create a temporary download link
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = file.name || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up object URL
      window.URL.revokeObjectURL(link.href);
    } else {
      console.error("Download failed, invalid response:", data);
    }
  } catch (err) {
    console.error("Download failed:", err);
  }
};

const handleDelete = async (item) => {
  try {
    const endpoint = item.type === "folder"
      ? `${API_BASE}/folders/${item.id}`
      : `${API_BASE}/files/${item.id}`;

    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert("Delete failed: " + (errorData.error || "Unknown error"));
      return;
    }

    alert(`${item.type === "folder" ? "Folder" : "File"} moved to trash.`);
    // Refresh folder contents
    fetchFolderContents(currentFolder.id === "root" ? null : currentFolder.id);
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Error deleting the " + item.type);
  }
};




  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📂 My Drive</h1>

      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 mb-4 text-blue-600 font-medium">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.id} className="flex items-center">
            <button
              onClick={() => goToFolder(index)}
              className="hover:underline"
            >
              {crumb.name}
            </button>
            {index < breadcrumbs.length - 1 && <span className="mx-2">›</span>}
          </span>
        ))}
      </div>

      

      {/* File/Folder Table */}
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3">Name</th>
            <th className="p-3">Owner</th>
            <th className="p-3">Last Modified</th>
            <th className="p-3">Size</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f, idx) => (
            <tr
              key={idx}
              className="border-b hover:bg-gray-50 cursor-pointer"
            >
              <td
                className="p-3"
                onClick={() =>
                  f.type === "folder" ? openFolder(f) : handleFileClick(f)
                }
              >
                {f.type === "folder" ? "📁" : "📄"} {f.name}
              </td>
              <td className="p-3">You</td>
              <td className="p-3">
                {f.updated_at ? new Date(f.updated_at).toLocaleDateString() : "-"}
              </td>
              <td className="p-3">
                {f.type === "folder"
                  ? "-"
                  : f.size_bytes
                  ? (f.size_bytes / 1024).toFixed(2) + " KB"
                  : "-"}
              </td>
              <td className="p-3  gap-2">
                {f.type !== "folder" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(f);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Download
                  </button>
                )}
              </td>
              <td className="p-3 flex items-center gap-2">
  {f.type !== "folder" && (
    <>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowShareFor(f);
        }}
        className="text-indigo-700 hover:underline ml-2"
        title="Share"
      >
        Share
      </button>
      <button
        onClick={async (e) => {
          e.stopPropagation();
          if (window.confirm(`Are you sure you want to delete "${f.name}"?`)) {
            await handleDelete(f);
          }
        }}
        className="text-red-600 hover:underline ml-2"
        title="Delete"
      >
        Delete
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowVersionsFor(f);
        }}
        className="text-green-700 hover:underline ml-2"
        title="Manage Versions"
      >
        Manage Versions
      </button>
      
    </>
  )}
  {f.type === "folder" && (
    <>
      <button
        onClick={async (e) => {
          e.stopPropagation();
          if (window.confirm(`Are you sure you want to delete folder "${f.name}" and its contents?`)) {
            await handleDelete(f);
          }
        }}
        className="text-red-600 hover:underline"
        title="Delete Folder"
      >
        Delete
      </button>
    </>
  )}
</td>

            </tr>
          ))}
        </tbody>
      </table>



      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg max-w-3xl max-h-[90%] overflow-auto">
            <h2 className="text-lg font-bold mb-2">{previewFile.name}</h2>
            <img
              src={previewUrl}
              alt={previewFile.name}
              className="max-h-[70vh] max-w-full object-contain"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => handleDownload(previewFile)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Download
              </button>
              <button
                onClick={() => {
                  setPreviewFile(null);
                  setPreviewUrl(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showShareFor && (
  <ShareFileModal
    file={showShareFor}
    onClose={() => setShowShareFor(null)}
  />
)}
{showVersionsFor && (
  <div
    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    onClick={() => setShowVersionsFor(null)}
  >
    <div
      className="bg-white p-6 rounded shadow-lg max-w-3xl max-h-[80vh] overflow-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setShowVersionsFor(null)}
        className="float-right mb-2 text-gray-500 hover:text-gray-700"
      >
        Close ✕
      </button>
      <h2 className="text-xl font-bold mb-4">Versions of: {showVersionsFor.name}</h2>
      <FileVersionList fileId={showVersionsFor.id} />
    </div>
  </div>
)}


    </div>
  );
};

export default MyDrive;
