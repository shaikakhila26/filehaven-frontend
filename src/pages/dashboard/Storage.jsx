import { useEffect, useState } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const formatMB = (bytes) => {
  if (typeof bytes !== "number" || isNaN(bytes)) return "0";
  return (bytes / 1024 / 1024).toFixed(2);
};

const Storage = () => {
  const [storage, setStorage] = useState({ used: 0, total: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${VITE_API_URL}/storage`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setStorage({
          used: data.used || 0,
          total: data.total || 1,
        });
        
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load storage data");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading storage info...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  const usedMB = formatMB(storage.used);
  const totalMB = formatMB(storage.total);
  const percentage = storage.total > 0 ? (storage.used / storage.total) * 100 : 0;

    return (

    <div className="p-4">

      <h1 className="text-2xl font-bold mb-4">💾 Storage</h1>

      <p className="mb-2">

        {usedMB} MB used of {totalMB} MB

      </p>

      <div className="w-full h-3 bg-gray-200 rounded-full">

        <div

          className="h-3 bg-blue-500 rounded-full transition-all duration-300"

          style={{ width: `${percentage.toFixed(2)}%` }}

        />

      </div>

    </div>

  );

};
export default Storage;
