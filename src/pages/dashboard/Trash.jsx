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

      if (!data.success){
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
    if (idx === breadcrumbs.length -1) return; // Clicking current folder does nothing
    const crumb = breadcrumbs[idx];
    setCurrentTrashParentId(crumb.id === "root" ? null : crumb.id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 flex items-center"><span role="img" aria-label="Trash" className="mr-2">🗑️</span>
      </h1>

      {/* Breadcrumbs navigation */}
      <nav className="mb-4 text-sm text-gray-600">
        {breadcrumbs.map((b, idx) => (
          <span key={b.id}>
            {idx > 0 && ' › '}
            <button
              disabled={idx === breadcrumbs.length - 1}
              onClick={() => onBreadcrumbClick(idx)}
             className={`${
              idx === breadcrumbs.length - 1
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
<table className="w-full bg-white shadow rounded">

      <thead>

        <tr className="border-b text-left">

          <th className="p-3">Name</th>

          <th className="p-3">Deleted On</th>

          <th className="p-3">Actions</th>

        </tr>

      </thead>

      <tbody>

        {/* Render folders */}

        {folders.map(folder => (

          <tr

            key={folder.id}

            className="cursor-pointer hover:bg-gray-50"

            onClick={() => openTrashFolder(folder.id)}

          >

            <td className="p-3 flex items-center">

              <FaRegFolder className="text-yellow-500 mr-2" />

              {folder.name}

            </td>

            <td className="p-3 text-sm text-gray-400">{new Date(folder.updated_at || folder.deleted_at || folder.created_at).toLocaleDateString()}</td>

            <td className="p-3 flex gap-2">

              <button

                disabled={loading}

                onClick={e => { e.stopPropagation(); handleRestore({ ...folder, type: "folder" }); }}

                className="text-green-600 hover:underline text-sm mr-2"

              >

                Restore

              </button>

              <button

                disabled={loading}

                onClick={e => { e.stopPropagation(); handleDeletePermanently({ ...folder, type: "folder" }); }}

                className="text-red-600 hover:underline text-sm"

              >

                Delete Permanently

              </button>

            </td>

          </tr>

        ))}

        {/* Render files */}

        {files.map(file => (

          <tr key={file.id} className="hover:bg-gray-50">

            <td className="p-3 flex items-center">

              <FaRegFile className="text-purple-700 mr-2" />

              {file.name}

            </td>

            <td className="p-3 text-sm text-gray-400">{new Date(file.updated_at || file.deleted_at || file.created_at).toLocaleDateString()}</td>

            <td className="p-3  flex items-center gap-2">

              <button

                disabled={loading}

                onClick={e => { e.stopPropagation(); handleRestore({ ...file, type: "file" }); }}

                className="text-green-600 hover:underline text-sm mr-2"

              >

                Restore

              </button>

              <button

                disabled={loading}

                onClick={e => { e.stopPropagation(); handleDeletePermanently({ ...file, type: "file" }); }}

                className="text-red-600 hover:underline text-sm"

              >

                Delete Permanently

              </button>

            </td>

          </tr>

        ))}

        {folders.length === 0 && files.length === 0 && !loading && (

          <tr>

            <td colSpan={3} className="p-4 text-gray-400 text-center">No items in trash.</td>

          </tr>

        )}

      </tbody>

    </table>

  </div>

);
};
     

export default Trash;

















/*
import { useEffect, useState } from "react";

const VITE_API_URL = "http://localhost:8080/api";

const Trash = () => {
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTrashParentId, setCurrentTrashParentId] = useState(null); 
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "root", name: "Trash" }]);

  const fetchTrash = async (parentId = null) => {
    try {
        setLoading(true);
         const parentIdParam = parentId ? `?parentId=${parentId}` : '';
      const res = await fetch(`${VITE_API_URL}/trash${parentIdParam}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      

      if (!data.success){
        console.error("Trash API returned error:", data.error);
      throw new Error(data.error || "Failed to load trash");
      } 

      const files = Array.isArray(data.files) ? data.files : [];
      const folders = Array.isArray(data.folders) ? data.folders : [];

      const allTrash = [
        ...files.map(f => ({ ...f, type: 'file' })),
        ...folders.map(f => ({ ...f, type: 'folder' }))
      ];

      setTrash(allTrash);
    } catch (err) {
      console.error(err);
      setTrash([]);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

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
      fetchTrash();
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
      fetchTrash();
    } catch (err) {
      alert(err.message || "Error deleting permanently");
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🗑️ Trash</h1>
      <ul className="bg-white shadow rounded divide-y">
        {trash.map((t, idx) => (
          <li key={idx} className="p-3 flex justify-between items-center">
            <span>
  [{t.type}] {t.name}
  <span className="ml-1 text-gray-500 text-xs block">
    {t.breadcrumbs?.length > 0
      ? t.breadcrumbs?.map(b => b.name).join(' › ')
      : 'Root'}
  </span>
  <span className="ml-3 text-sm text-gray-500">
    Deleted on {new Date(t.updated_at || t.deleted_at || t.created_at).toLocaleDateString()}
  </span>
</span>

            <span className="flex gap-2">
              <button
                disabled={loading}
                onClick={() => handleRestore(t)}
                className="text-green-600 hover:underline text-sm"
                title="Restore"
              >
                Restore
              </button>
              <button
                disabled={loading}
                onClick={() => handleDeletePermanently(t)}
                className="text-red-600 hover:underline text-sm"
                title="Delete Permanently"
              >
                Delete Permanently
              </button>
            </span>
          </li>
        ))}
      </ul>
      {trash.length === 0 && (
        <div className="p-3 text-gray-400">No items in trash.</div>
      )}
    </div>
  );
};

export default Trash;

*/


















/*import { useEffect, useState } from "react";

const Trash = () => {
  const [trash, setTrash] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/trash", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        // Merge files and folders into a single list for display
        const files = Array.isArray(data?.files) ? data.files : [];
        const folders = Array.isArray(data?.folders) ? data.folders : [];
        // Add a 'type' property for display clarity (optional)
        const allTrash = [
          ...files.map(f => ({ ...f, type: 'file' })),
          ...folders.map(f => ({ ...f, type: 'folder' }))
        ];
        setTrash(allTrash);
      })
      .catch(err => {
        setTrash([]);
        console.error(err);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🗑️ Trash</h1>
      <ul className="bg-white shadow rounded divide-y">
        {trash.map((t, idx) => (
          <li key={idx} className="p-3 flex justify-between">
            <span>
              [{t.type}] {t.name}
            </span>
            <span className="text-sm text-gray-500">
              Deleted on {new Date(t.updated_at || t.deleted_at || t.created_at).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
      {trash.length === 0 && (
        <div className="p-3 text-gray-400">No items in trash.</div>
      )}
    </div>
  );
};

export default Trash;

*/
