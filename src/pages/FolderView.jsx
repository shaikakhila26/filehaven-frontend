import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const FolderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contents, setContents] = useState({ folders: [], files: [] });

  useEffect(() => {
    fetch(`${VITE_API_URL}/folder-contents?folderId=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setContents(data))
      .catch(console.error);
  }, [id]);

  // ⬇️ Click handler for folders & files
  const handleClick = async (item, type) => {
    if (type === "folder") {
      navigate(`/folder/${item.id}`); // open sub-folder
    } else {
      try {
        const res = await fetch(`${VITE_API_URL}/files/${item.id}/download`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.url) {
          window.open(data.url, "_blank");
        } else {
          alert("Failed to generate download link");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching file");
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📁 Folder</h1>
      <ul className="bg-white shadow rounded divide-y">
        {contents.folders.map((f) => (
          <li
            key={f.id}
            className="p-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleClick(f, "folder")}
          >
            📁 {f.name}
          </li>
        ))}
        {contents.files.map((f) => (
          <li
            key={f.id}
            className="p-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleClick(f, "file")}
          >
            📄 {f.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FolderView;
