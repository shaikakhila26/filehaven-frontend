// NewFolderModal.jsx
import { useState } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const NewFolderModal = ({ onClose,parentId }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
  setLoading(true);
  setError("");
  try {
    const res = await fetch(`${VITE_API_URL}/folders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    body: JSON.stringify({
  name,
  parent_id: parentId === "root" ? null : parentId, // snake_case to match backend
}),


    });

    if (!res.ok) {
  const errText = await res.text();
  console.error("Backend error:", errText);
  throw new Error(errText || "Failed to create folder");
}


    const data = await res.json();
    console.log("Folder created:", data);

    onClose(); // close modal / refresh file list
  } catch (err) {
    setError(err.message);
  }
  setLoading(false);
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow p-4 max-w-xs w-full">
        <h2 className="text-xl font-bold mb-2">Create New Folder</h2>
        <input
          className="w-full p-2 border rounded mb-2"
          placeholder="Folder Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="bg-blue-600 text-white px-3 py-1 rounded w-full sm:w-auto" onClick={handleCreate} disabled={loading || !name}>
            {loading ? "Creating..." : "Create"}
          </button>
          <button className="bg-gray-300 px-3 py-1 rounded w-full sm:w-auto" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default NewFolderModal;
