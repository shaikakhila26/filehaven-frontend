import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const FolderView = () => {
  const { id } = useParams();
  const [contents, setContents] = useState({ folders: [], files: [] });

  useEffect(() => {
    fetch(`${VITE_API_URL}/folder-contents?folderId=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setContents(data))
      .catch(() => setContents({ folders: [], files: [] }));
  }, [id]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">📂 Folder</h1>
      <ul className="bg-white shadow rounded divide-y">
        {contents.folders.map((f) => (
          <li key={f.id} className="p-3">📁 {f.name}</li>
        ))}
        {contents.files.map((f) => (
          <li key={f.id} className="p-3">📄 {f.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default FolderView;
