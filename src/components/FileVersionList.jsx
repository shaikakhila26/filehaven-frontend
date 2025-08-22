import { useEffect, useState } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function FileVersionList({ fileId }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fileId) return;
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${VITE_API_URL}/files/${fileId}/versions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.success) setVersions(data.versions);
        else console.error(data.error);
      } catch (err) {
        console.error("Failed to fetch versions", err);
      }
      setLoading(false);
    };
    fetchVersions();
  }, [fileId]);

  const handleRestore = async (versionId) => {
    if (!window.confirm("Restore this version?")) return;
    try {
      const res = await fetch(`${VITE_API_URL}/files/${fileId}/versions/${versionId}/restore`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) alert("Version restored successfully!");
      else alert("Restore failed: " + (data.error || ""));
    } catch (err) {
      alert("Error restoring version");
    }
  };

  const handleDownload = (version) => {
    // Implement download logic using storage_key or pre-signed url
    // Example: open new tab with URL or use fetch to get blob and trigger download
  };

  if (loading) return <div>Loading versions...</div>;
  if (versions.length === 0) return <div>No versions found.</div>;

  return (

    <div className="w-full">

      {/* Desktop Table */}

      <div className="hidden md:block overflow-x-auto">

        <table className="w-full border-collapse border text-sm">

          <thead className="bg-gray-100 dark:bg-zinc-800">

            <tr>

              <th className="border px-3 py-2 text-left">Version</th>

              <th className="border px-3 py-2 text-left">Created At</th>

              <th className="border px-3 py-2 text-left">Actions</th>

            </tr>

          </thead>

          <tbody>

            {versions.map((version) => (

              <tr key={version.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">

                <td className="border px-3 py-2">{version.version_number}</td>

                <td className="border px-3 py-2">

                  {new Date(version.created_at).toLocaleString()}

                </td>

                <td className="border px-3 py-2 space-x-2">

                  <button

                    onClick={() => handleRestore(version.id)}

                    className="text-green-600 hover:underline"

                  >

                    Restore

                  </button>

                  <button

                    onClick={() => handleDownload(version)}

                    className="text-blue-600 hover:underline"

                  >

                    Download

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>



      {/* Mobile Cards */}

      <div className="md:hidden space-y-3">

        {versions.map((version) => (

          <div

            key={version.id}

            className="border rounded-lg p-3 bg-white dark:bg-zinc-900 shadow-sm"

          >

            <div className="flex justify-between items-center">

              <span className="font-medium text-gray-800 dark:text-zinc-100">

                Version {version.version_number}

              </span>

              <span className="text-xs text-gray-500">

                {new Date(version.created_at).toLocaleDateString()}

              </span>

            </div>

            <div className="text-xs text-gray-500 mb-2">

              {new Date(version.created_at).toLocaleTimeString()}

            </div>

            <div className="flex gap-4 text-sm">

              <button

                onClick={() => handleRestore(version.id)}

                className="text-green-600 hover:underline"

              >

                Restore

              </button>

              <button

                onClick={() => handleDownload(version)}

                className="text-blue-600 hover:underline"

              >

                Download

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}



export default FileVersionList;