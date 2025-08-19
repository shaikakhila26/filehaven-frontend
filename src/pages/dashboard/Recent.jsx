import { useEffect, useState } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const Recent = () => {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetch(`${VITE_API_URL}/recent`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) =>{
        if (Array.isArray(data)) {
          setRecent(data);
        }
        else {
            setRecent([]);
            console.error("Unexpected data format:", data);
      } })
      .catch((err) =>{
        setRecent([]);
        console.error("Error fetching recent items:", err);
      } );
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🕒 Recent Activity</h1>
      <ul className="bg-white shadow rounded divide-y">
        {recent.map((r, idx) => (
          <li key={idx} className="p-3 flex justify-between">
            <span>{r.name}</span>
            <span className="text-sm text-gray-500">{r.owner}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recent;
