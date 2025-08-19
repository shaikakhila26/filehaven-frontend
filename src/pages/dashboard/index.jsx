import { Routes, Route } from "react-router-dom";
import Layout from "../../components/Layout";
import { useState, useEffect } from "react";

import Home from "./Home";
import MyDrive from "./MyDrive";
import Shared from "./Shared";
import Recent from "./Recent";
import Starred from "./Starred";
import Trash from "./Trash";
import Storage from "./Storage";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const Dashboard = () => {
  const [storage, setStorage] = useState({ used: 0, total: 1024 * 1024 * 500 });

  useEffect(() => {
    fetch(`${VITE_API_URL}/storage`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setStorage(data))
      .catch((err) => console.error(err));
  }, []);

  const handleNewClick = (type) => {
    if (type === "folder") {
      console.log("Create new folder API call");
    } else if (type === "file") {
      console.log("Open file upload dialog");
    } else if (type === "folderUpload") {
      console.log("Open folder upload dialog");
    }
  };

  return (
    <Layout onNewClick={handleNewClick} storage={storage}>
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="my-drive" element={<MyDrive />} />
        <Route path="shared" element={<Shared />} />
        <Route path="recent" element={<Recent />} />
        <Route path="starred" element={<Starred />} />
        <Route path="trash" element={<Trash />} />
        <Route path="storage" element={<Storage />} />
      </Routes>
    </Layout>
  );
};

export default Dashboard;
