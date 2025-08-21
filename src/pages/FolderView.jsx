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

    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4">

      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">

        📁 Folder

      </h1>



      <ul className="bg-white shadow rounded-lg divide-y sm:divide-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">

        {contents.folders.map((f) => (

          <li

            key={f.id}

            className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer flex items-center rounded sm:shadow-sm"

            onClick={() => handleClick(f, "folder")}

          >

            <span className="mr-2">📁</span>

            <span className="truncate">{f.name}</span>

          </li>

        ))}

        {contents.files.map((f) => (

          <li

            key={f.id}

            className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer flex items-center rounded sm:shadow-sm"

            onClick={() => handleClick(f, "file")}

          >

            <span className="mr-2">📄</span>

            <span className="truncate">{f.name}</span>

          </li>

        ))}

      </ul>

    </div>

  );

};



export default FolderView;
