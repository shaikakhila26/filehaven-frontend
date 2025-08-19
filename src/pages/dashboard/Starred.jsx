import { useEffect, useState } from "react";

const Starred = () => {
  const [starred, setStarred] = useState([]);

  useEffect(() => {
  fetch("http://localhost:8080/api/starred", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  })
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setStarred(data);
      } else {
        setStarred([]); // fallback to empty array
      }
    })
    .catch((err) => {
      setStarred([]); // on network error
      console.error(err);
    });
}, []);


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">⭐ Starred Items</h1>
      <ul className="bg-white shadow rounded divide-y">
        {starred.map((s, idx) => (
          <li key={idx} className="p-3 flex justify-between">
            <span>{s.name}</span>
            <span className="text-sm text-gray-500">{s.owner}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Starred;
