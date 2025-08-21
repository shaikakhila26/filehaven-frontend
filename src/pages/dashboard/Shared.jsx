import { useEffect, useState } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const Shared = () => {
  const [sharedFiles, setSharedFiles] = useState([]);

  useEffect(() => {
    fetch(`${VITE_API_URL}/shared-with-me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setSharedFiles(data))
      .catch((err) => console.error(err));
  }, []);

  const openSharedFile = async (fileId) => {
  try {
    const res = await fetch(`${VITE_API_URL}/files/${fileId}/download`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Failed to fetch download link");
    const data = await res.json();
    if (data.url) {
      window.open(data.url, "_blank", "noopener,noreferrer");
    } else {
      alert("No URL available to open.");
    }
  } catch (err) {
    console.error("Error opening shared file:", err);
    alert("Error opening file. Please try again.");
  }
};


return (

    <div className="p-4">

      <h1 className="text-2xl font-bold mb-4">🔗 Shared with Me</h1>

      <div className="overflow-x-auto shadow-md rounded-lg">

        <table className="w-full bg-white">

          <thead>

            <tr className="text-left border-b">

              <th className="p-3">Name</th>

              <th className="p-3">Shared By</th>

              <th className="p-3">Date Shared</th>

            </tr>

          </thead>

          <tbody>

            {sharedFiles.map((f, idx) => (

              <tr key={idx} className="border-b hover:bg-gray-50">

                <td className="p-3">

                  <button

                    onClick={() => openSharedFile(f.id)}

                    className="text-blue-600 underline"

                  >

                    {f.name}

                  </button>

                </td>

                <td className="p-3">{f.shared_by}</td>

                <td className="p-3">{new Date(f.shared_at).toLocaleDateString()}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default Shared;
