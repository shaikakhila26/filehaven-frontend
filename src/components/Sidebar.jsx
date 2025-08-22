import { useState } from "react";
import { Link } from "react-router-dom";
import { FolderPlus, Upload, FolderUp, Home, HardDrive, Share2, Clock, Star, Trash2, Database } from "lucide-react";

const Sidebar = ({ onNewClick, storage }) => {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const usedMB = storage && !isNaN(storage.used) ? (storage.used / 1024 / 1024).toFixed(2) : "0";
  const totalMB = storage && !isNaN(storage.total) ? (storage.total / 1024 / 1024).toFixed(2) : "0";
  const percentageRaw = storage.total > 0 ? (storage.used / storage.total) * 100 : 0;
// Cap between 0 and 100 to avoid invalid width
const percentage = Math.min(Math.max(percentageRaw, 0), 100);

  return (
    <div className="w-64 h-screen bg-blue-700 text-white flex flex-col p-4">
      {/* Logo */}
      <div className=" flex gap-3 mb-4 mt-4 ml-2"> 
        <img src="/logo.jpg" alt="FileHaven Logo" className="h-8 rounded-lg " />
       <h2 className="text-2xl font-bold mb-6 "> FileHaven </h2>  </div>

      {/* New button */}
      <div className="relative mb-4">
        <button
          onClick={() => setShowNewMenu(!showNewMenu)}
          className="bg-blue-500 hover:bg-blue-600 w-full flex items-center justify-center py-2 rounded-lg  mr-4"
        >
          + New
        </button>
        {showNewMenu && (
          <div className="absolute mt-1 w-full bg-white text-black shadow-lg rounded z-50">
            <button
              onClick={() => onNewClick("folder")}
              className="flex items-center px-4 py-2 hover:bg-gray-100 w-full"
            >
              <FolderPlus className="w-4 h-4 mr-2" /> New Folder
            </button>
            <button
              onClick={() => onNewClick("file")}
              className="flex items-center px-4 py-2 hover:bg-gray-100 w-full"
            >
              <Upload className="w-4 h-4 mr-2" /> File Upload
            </button>
            <button
              onClick={() => onNewClick("folderUpload")}
              className="flex items-center px-4 py-2 hover:bg-gray-100 w-full"
            >
              <FolderUp className="w-4 h-4 mr-2" /> Folder Upload
            </button>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-3 flex-grow">
        <Link to="/dashboard/home" className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded">
          <Home size={18} /> Home
        </Link>
        <Link to="/dashboard/my-drive" className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded">
          <HardDrive size={18} /> My Drive
        </Link>
        <Link to="/dashboard/shared" className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded">
          <Share2 size={18} /> Shared with me
        </Link>
        <Link to="/dashboard/recent" className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded">
          <Clock size={18} /> Recent
        </Link>
        <Link to="/dashboard/starred" className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded">
          <Star size={18} /> Starred
        </Link>
        <Link to="/dashboard/trash" className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded">
          <Trash2 size={18} /> Trash
        </Link>


        <Link to="/dashboard/storage" className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded">
  <Database size={18} /> Storage
</Link>
 {/* Visual progress bar */}
        <div className="ml-5  mt-1 w-4/5 bg-green-300 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentage }%` }}
          />
        </div>
<div className="ml-10 text-xs text-blue-300">
          {usedMB} MB of {totalMB} MB used
        </div>

      </nav>

   
      
    </div>
  );
};

export default Sidebar;
