import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";


const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";


const Starred = () => {
  const [starred, setStarred] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${VITE_API_URL}/starred`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStarred(data);
        } else {
          setStarred([]);
        }
      })
      .catch(() => setStarred([]));
  }, []);

  const handleClick = (item) => {
  if (item.type === "folder") {
    navigate(`/folder/${item.id}`);
  } else {
    window.open(`${VITE_API_URL}/files/${item.id}/download`, "_blank");
  }
};


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">⭐ Starred Items</h1>
      <ul className="bg-white shadow rounded divide-y">
        {starred.length > 0 ? (
          starred.map((s) => (
            <li
              key={s.id}
              className="p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
              onClick={() => handleClick(s)}
            >
              <div className="flex items-center gap-2">
                {s.type === "folder" ? "📁" : "📄"}
                <span>{s.name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(s.created_at).toLocaleDateString()}
              </span>
            </li>
          ))
        ) : (
          <li className="p-3 text-gray-500">No starred items yet</li>
        )}
      </ul>
    </div>
  );
};


export default Starred;