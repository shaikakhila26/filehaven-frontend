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

  if (loading) 
  {

    return (
    
<div className="flex items-center justify-center min-h-screen bg-gray-50">

        <p className="text-gray-600 animate-pulse">Loading shared file...</p>

      </div>

    );

  }


  


  if (error) {

    return (

      <div className="flex items-center justify-center min-h-screen bg-gray-50">

        <p className="text-red-600 font-medium">{error}</p>

      </div>

    );

  }



  return (

    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">

      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 w-full max-w-md">

        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">

          📄 Shared File

        </h2>



        <div className="space-y-2 text-sm sm:text-base text-gray-700">

          <p>

            <strong className="text-gray-900">Name:</strong> {data.file.name}

          </p>

          <p>

            <strong className="text-gray-900">Size:</strong>{" "}

            {(data.file.size / 1024).toFixed(2)} KB

          </p>

          {data.expires_at && (

            <p>

              <strong className="text-gray-900">Expires:</strong>{" "}

              {new Date(data.expires_at).toLocaleString()}

            </p>

          )}

          <p>

            <strong className="text-gray-900">Permission:</strong>{" "}

            {data.permission}

          </p>

        </div>



        <a

          href={data.url}

          target="_blank"

          rel="noopener noreferrer"

          className="mt-6 block text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"

        >

          ⬇️ Download

        </a>

      </div>

    </div>

  );

}
