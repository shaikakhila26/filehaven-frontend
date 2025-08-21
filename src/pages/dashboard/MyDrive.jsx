import { useEffect, useState } from "react";
import { useFolder } from "../../context/FolderContext";
import ShareFileModal from "../../components/modals/ShareFileModal";
import FileVersionList from "../../components/FileVersionList";
import { Star, StarOff, Download, Share2, Trash2, Edit2, FileText, Folder, X, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const MyDrive = ({ onFolderChange }) => {
  const [files, setFiles] = useState([]);
  const [showVersionsFor, setShowVersionsFor] = useState(null);
  const { setCurrentFolderId } = useFolder();
  const [breadcrumbs, setBreadcrumbs] = useState([
    { id: "root", name: "My Drive", type: "folder" },
  ]);
  const currentFolder = breadcrumbs[breadcrumbs.length - 1];

  // State
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showShareFor, setShowShareFor] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [newName, setNewName] = useState("");

  // Fetch folder contents
  const fetchFolderContents = async (folderId) => {
    try {
      const url =
        !folderId || folderId === "root"
          ? `${VITE_API_URL}/folder-contents`
          : `${VITE_API_URL}/folder-contents?folderId=${folderId}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await res.json();

      const normalized = [
        ...(data.folders || []).map((f) => ({ ...f, type: "folder" })),
        ...(data.files || []).map((f) => ({ ...f, type: "file" })),
      ];

      setFiles(normalized);
    } catch (err) {
      console.error("Error fetching folder contents:", err);
    }
  };

  useEffect(() => {
    fetchFolderContents("root");
  }, []);

  // Navigation
  const openFolder = (folder) => {
    if (folder.type !== "folder") return;
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name, type: "folder" }]);
    fetchFolderContents(folder.id);
    setCurrentFolderId(folder.id);
    onFolderChange?.(folder.id);
  };

  const goToFolder = (index) => {
    const newPath = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newPath);
    fetchFolderContents(newPath[newPath.length - 1].id);
    setCurrentFolderId(newPath[newPath.length - 1].id);
    onFolderChange?.(newPath[newPath.length - 1].id);
  };

  // File handling
  const handleFileClick = async (file) => {
    if (file.type === "folder") return openFolder(file);

    try {
      const res = await fetch(`${VITE_API_URL}/files/${file.id}/download`, {
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
      }
    } catch (err) {
      console.error("Error opening file:", err);
    }
  };

  const handleDownload = async (file) => {
    try {
      const res = await fetch(`${VITE_API_URL}/files/${file.id}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await res.json();
      if (data.url) {
        const blobRes = await fetch(data.url);
        const blob = await blobRes.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = file.name || "download";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(link.href);
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleDelete = async (item) => {
    try {
      const endpoint =
        item.type === "folder"
          ? `${VITE_API_URL}/folders/${item.id}`
          : `${VITE_API_URL}/files/${item.id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Delete failed: " + (errorData.error || "Unknown error"));
        return;
      }
      fetchFolderContents(currentFolder.id === "root" ? null : currentFolder.id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleRename = async () => {
    if (!renameTarget || !newName.trim()) return;
    try {
      const res = await fetch(`${VITE_API_URL}/folders/${renameTarget.id}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ newName }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert("Rename failed: " + (errData.error || "Unknown error"));
        return;
      }

      setRenameTarget(null);
      setNewName("");
      fetchFolderContents(currentFolder.id === "root" ? null : currentFolder.id);
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  const toggleStar = async (item) => {
    try {
      const endpoint =
        item.type === "folder"
          ? `${VITE_API_URL}/folders/${item.id}/star`
          : `${VITE_API_URL}/files/${item.id}/star`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ starred: !item.is_starred }),
      });

      if (!res.ok) throw new Error("Failed to star item");

      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, is_starred: !f.is_starred } : f))
      );
    } catch (err) {
      console.error("Star toggle failed:", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📂 My Drive</h1>

      {/* Breadcrumbs */}
      <div className="flex items-center flex-wrap gap-2 mb-6">
        {breadcrumbs.map((crumb, index) => (
          <button
            key={crumb.id}
            onClick={() => goToFolder(index)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium"
          >
            {crumb.name}
          </button>
        ))}
      </div>

      {/* File Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full bg-white">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Last Modified</th>
              <th className="p-3">Size</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr
                key={f.id}
                className="border-b hover:bg-gray-50 transition"
                onClick={() => f.type === "folder" ? openFolder(f) : handleFileClick(f)}
              >
                <td className="p-3 flex items-center gap-2">
                  {f.type === "folder" ? (
                    <Folder className="w-5 h-5 text-blue-500" />
                  ) : (
                    <FileText className="w-5 h-5 text-gray-500" />
                  )}
                  {f.name}
                </td>
                <td className="p-3 text-center">You</td>
                <td className="p-3 text-center">
                  {f.updated_at ? new Date(f.updated_at).toLocaleDateString() : "-"}
                </td>
                <td className="p-3 text-center">
                  {f.type === "folder"
                    ? "-"
                    : f.size_bytes
                    ? (f.size_bytes / 1024).toFixed(2) + " KB"
                    : "-"}
                </td>
                <td className="p-3 flex items-center justify-center gap-2 sm:gap-3">
                  {/* Star */}
                  <button onClick={(e) => { e.stopPropagation(); toggleStar(f); }}>
                    {f.is_starred ? <Star className="w-5 h-5 text-yellow-500" /> : <StarOff className="w-5 h-5 text-gray-400" />}
                  </button>

                  {/* Actions */}
                  {f.type !== "folder" && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(f); }}>
                        <Download className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setShowShareFor(f); }}>
                        <Share2 className="w-5 h-5 text-indigo-500 hover:text-indigo-700" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setShowVersionsFor(f); }}>
                        <History className="w-5 h-5 text-green-600 hover:text-green-800" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${f.name}"?`)) handleDelete(f); }}>
                        <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                      </button>
                    </>
                  )}

                  {f.type === "folder" && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setRenameTarget(f); setNewName(f.name); }}>
                        <Edit2 className="w-5 h-5 text-yellow-500 hover:text-yellow-700" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete folder "${f.name}"?`)) handleDelete(f); }}>
                        <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{previewFile.name}</h2>
                <button onClick={() => { setPreviewFile(null); setPreviewUrl(null); }}>
                  <X className="w-5 h-5 text-gray-600 hover:text-black" />
                </button>
              </div>
              <img src={previewUrl} alt={previewFile.name} className="max-h-[70vh] max-w-full object-contain mx-auto" />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => handleDownload(previewFile)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
                >
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      {showShareFor && <ShareFileModal file={showShareFor} onClose={() => setShowShareFor(null)} />}

      {/* Versions Modal */}
      {showVersionsFor && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-auto">
            <button onClick={() => setShowVersionsFor(null)} className="float-right mb-2">
              <X className="w-5 h-5 text-gray-500 hover:text-black" />
            </button>
            <h2 className="text-xl font-bold mb-4">Versions of: {showVersionsFor.name}</h2>
            <FileVersionList fileId={showVersionsFor.id} />
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Rename Folder</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDrive;
