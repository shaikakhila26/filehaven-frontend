import { useEffect, useState } from "react";
import { FaRegFolder, FaRegFile } from "react-icons/fa"; // Icons for folder/file

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const Trash = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTrashParentId, setCurrentTrashParentId] = useState(null); 
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "root", name: "Trash" }]);

  const fetchTrash = async (parentId = null) => {
    setLoading(true);
    try {
      const parentIdParam = parentId ? `?parentId=${parentId}` : '';
      const res = await fetch(`${VITE_API_URL}/trash${parentIdParam}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();

      if (!data.success) {
        console.error("Trash API returned error:", data.error);
        throw new Error(data.error || "Failed to load trash");
      }

      setFiles(data.files || []);
      setFolders(data.folders || []);
      setBreadcrumbs(data.breadcrumbs && data.breadcrumbs.length > 0 ? data.breadcrumbs : [{ id: "root", name: "Trash" }]);
    } catch (err) {
      console.error(err);
      setFiles([]);
      setFolders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrash(currentTrashParentId);
  }, [currentTrashParentId]);

  const handleRestore = async (item) => {
    if (!window.confirm(`Restore ${item.type} "${item.name}"?`)) return;

    setLoading(true);
    try {
      const endpoint = item.type === 'file'
        ? `${VITE_API_URL}/trash/restore/file/${item.id}`
        : `${VITE_API_URL}/trash/restore/folder/${item.id}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Restore failed");

      alert(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} restored.`);
      fetchTrash(currentTrashParentId);
    } catch (err) {
      alert(err.message || "Error restoring");
    }
    setLoading(false);
  };

  const handleDeletePermanently = async (item) => {
    if (!window.confirm(`Permanently delete ${item.type} "${item.name}"? This action cannot be undone.`)) return;

    setLoading(true);
    try {
      const endpoint = item.type === 'file'
        ? `${VITE_API_URL}/trash/file/${item.id}/permanent`
        : `${VITE_API_URL}/trash/folder/${item.id}/permanent`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Delete failed");

      alert(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} permanently deleted.`);
      fetchTrash(currentTrashParentId);
    } catch (err) {
      alert(err.message || "Error deleting permanently");
    }
    setLoading(false);
  };

  // Handle clicking a folder — navigate into it inside Trash
  const openTrashFolder = (folderId) => {
    setCurrentTrashParentId(folderId);
  };

  // Handle breadcrumb click — navigate back up Trash tree
  const onBreadcrumbClick = (idx) => {
    if (idx === breadcrumbs.length - 1) return; // Clicking current folder does nothing
    const crumb = breadcrumbs[idx];
    setCurrentTrashParentId(crumb.id === "root" ? null : crumb.id);
  };

  // Recursive rendering of folder contents
  const renderFolderContents = (items) => {
    return items.map(item => (
      <tr
        key={item.id}
        className={item.type === 'folder' ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50'}
        onClick={item.type === 'folder' ? (e) => { e.stopPropagation(); openTrashFolder(item.id); } : null}
      >
        <td className="p-3 flex items-center">
          {item.type === 'folder' ? (
            <FaRegFolder className="text-yellow-500 mr-2" />
          ) : (
            <FaRegFile className="text-purple-700 mr-2" />
          )}
          {item.name}
          {item.type === 'file' && item.folder_id && (
            <span className="ml-2 text-xs text-gray-500">
              (in {folders.find(f => f.id === item.folder_id)?.name || 'Unknown Folder'})
            </span>
          )}
        </td>
        <td className="p-3 text-sm text-gray-400">
          {new Date(item.updated_at || item.deleted_at || item.created_at).toLocaleDateString()}
        </td>
        <td className="p-3 flex gap-2">
          <button
            disabled={loading}
            onClick={(e) => { e.stopPropagation(); handleRestore({ ...item, type: item.type }); }}
            className="text-green-600 hover:underline text-sm mr-2"
          >
            Restore
          </button>
          <button
            disabled={loading}
            onClick={(e) => { e.stopPropagation(); handleDeletePermanently({ ...item, type: item.type }); }}
            className="text-red-600 hover:underline text-sm"
          >
            Delete Permanently
          </button>
        </td>
      </tr>
    ));
  };

  return (

    <div className="p-4">

      <h1 className="text-2xl font-bold mb-4 flex items-center">

        <span role="img" aria-label="Trash" className="mr-2">🗑️</span>

        Trash

      </h1>



      {/* Breadcrumbs navigation */}

      <nav className="mb-4 text-sm text-gray-600 flex flex-wrap gap-1">

        {breadcrumbs.map((b, idx) => (

          <span key={b.id}>

            {idx > 0 && ' › '}

            <button

              disabled={idx === breadcrumbs.length - 1}

              onClick={() => onBreadcrumbClick(idx)}

              className={`

                ${idx === breadcrumbs.length - 1

                  ? "cursor-default font-semibold text-black"

                  : "text-blue-600 cursor-pointer underline"

                }`}

            >

              {b.name}

            </button>

          </span>

        ))}

      </nav>



      {loading && <div>Loading...</div>}

      <div className="overflow-x-auto shadow-md rounded-lg">

        <table className="w-full bg-white">

          <thead>

            <tr className="border-b text-left">

              <th className="p-3">Name</th>

              <th className="p-3">Deleted On</th>

              <th className="p-3">Actions</th>

            </tr>

          </thead>

          <tbody>

            {renderFolderContents([...folders, ...files])}

            {folders.length === 0 && files.length === 0 && !loading && (

              <tr>

                <td colSpan={3} className="p-4 text-gray-400 text-center">No items in trash.</td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

};



export default Trash;