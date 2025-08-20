import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import DashboardLayout from "./pages/dashboard/LayoutWrapper"; // we'll make this

import DashboardHome from "./pages/dashboard/Home";
import MyDrive from "./pages/dashboard/MyDrive";
import Shared from "./pages/dashboard/Shared";
import Recent from "./pages/dashboard/Recent";
import Starred from "./pages/dashboard/Starred";
import Trash from "./pages/dashboard/Trash";
import Storage from "./pages/dashboard/Storage";
import { FolderProvider } from "./context/FolderContext";
import SharedFile from "./pages/SharedFile";


import FolderView from "./pages/FolderView";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  return (
    <FolderProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />

         <Route path="/s/:token" element={<SharedFile />} />
         <Route path="/folder/:id" element={<FolderView />} />

        {/** Dashboard nested routes */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route path="home" element={<DashboardHome />} />
          <Route path="my-drive" element={<MyDrive />} />
          <Route path="shared" element={<Shared />} />
          <Route path="recent" element={<Recent />} />
          <Route path="starred" element={<Starred />} />
          <Route path="trash" element={<Trash />} />
          <Route path="storage" element={<Storage />} />
         
          <Route index element={<Navigate to="home" />} /> {/* default to home */}
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    </FolderProvider>
  );
}

export default App;
