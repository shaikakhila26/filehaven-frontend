// src/pages/SharedFile.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SharedFile() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/s/${token}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Invalid link");
        setData(result);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchShared();
  }, [token]);

  if (loading) return <p className="text-center mt-10">Loading shared file...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Shared File</h2>
        <p><strong>Name:</strong> {data.file.name}</p>
        <p><strong>Size:</strong> {(data.file.size / 1024).toFixed(2)} KB</p>
        {data.expires_at && (
          <p><strong>Expires:</strong> {new Date(data.expires_at).toLocaleString()}</p>
        )}
        <p><strong>Permission:</strong> {data.permission}</p>

        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Download
        </a>
      </div>
    </div>
  );
}
