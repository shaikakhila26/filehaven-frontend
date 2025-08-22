import { useState } from "react";
import { Link } from "react-router-dom";
import { FolderPlus, Upload, FolderUp, Home, HardDrive, Share2, Clock, Star, Trash2, Database , X } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";


const Sidebar = ({ onNewClick, storage }) => {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [open,setOpen] = useState(false);
  const usedMB = storage && !isNaN(storage.used) ? (storage.used / 1024 / 1024).toFixed(2) : "0";
  const totalMB = storage && !isNaN(storage.total) ? (storage.total / 1024 / 1024).toFixed(2) : "0";
  const percentageRaw = storage.total > 0 ? (storage.used / storage.total) * 100 : 0;
// Cap between 0 and 100 to avoid invalid width
const percentage = Math.min(Math.max(percentageRaw, 0), 100);

 return (

    <>

      {/* Mobile topbar with hamburger */}

      <div className="md:hidden flex items-center justify-between bg-blue-700 text-white px-4 py-3">

        <div className="flex items-center gap-2">

          <img src="/logo.jpg" alt="FileHaven Logo" className="h-8 rounded-lg" />

          <h2 className="text-xl font-bold">FileHaven</h2>

        </div>

        <button onClick={() => setOpen(true)}>

          <Menu size={24} />

        </button>

      </div>



      {/* Sidebar drawer for mobile */}

      <div

        className={`fixed inset-y-0 left-0 w-64 bg-blue-700 text-white p-4 transform transition-transform duration-300 z-50 md:translate-x-0 md:static md:h-screen md:flex md:flex-col ${

          open ? "translate-x-0" : "-translate-x-full"

        }`}

      >

        {/* Close button for mobile */}

        <div className="flex items-center justify-between mb-6 md:hidden">

          <div className="flex items-center gap-2">

            <img

              src="/logo.jpg"

              alt="FileHaven Logo"

              className="h-8 rounded-lg"

            />

            <h2 className="text-xl font-bold">FileHaven</h2>

          </div>

          <button onClick={() => setOpen(false)}>

            <X size={24} />

          </button>

        </div>



        {/* Logo for desktop */}

        <div className="hidden md:flex items-center gap-3 mb-6">

          <img src="/logo.jpg" alt="FileHaven Logo" className="h-8 rounded-lg" />

          <h2 className="text-2xl font-bold">FileHaven</h2>

        </div>



        {/* New button */}

        <div className="relative mb-4">

          <button

            onClick={() => setShowNewMenu(!showNewMenu)}

            className="bg-blue-500 hover:bg-blue-600 w-full flex items-center justify-center py-2 rounded-lg"

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

        <nav className="flex flex-col gap-3 flex-grow overflow-y-auto">

          <Link

            to="/dashboard/home"

            className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded"

          >

            <Home size={18} /> Home

          </Link>

          <Link

            to="/dashboard/my-drive"

            className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded"

          >

            <HardDrive size={18} /> My Drive

          </Link>

          <Link

            to="/dashboard/shared"

            className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded"

          >

            <Share2 size={18} /> Shared with me

          </Link>

          <Link

            to="/dashboard/recent"

            className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded"

          >

            <Clock size={18} /> Recent

          </Link>

          <Link

            to="/dashboard/starred"

            className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded"

          >

            <Star size={18} /> Starred

          </Link>

          <Link

            to="/dashboard/trash"

            className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded"

          >

            <Trash2 size={18} /> Trash

          </Link>

          <Link

            to="/dashboard/storage"

            className="flex items-center gap-3 hover:bg-blue-600 p-2 rounded"

          >

            <Database size={18} /> Storage

          </Link>



          {/* Storage bar */}

          <div className="ml-5 mt-2 w-4/5 bg-green-300 rounded-full h-2">

            <div

              className="bg-blue-500 h-2 rounded-full transition-all duration-500"

              style={{ width: `${percentage}%` }}

            />

          </div>

          <div className="ml-10 text-xs text-blue-300">

            {usedMB} MB of {totalMB} MB used

          </div>

        </nav>

      </div>



      {/* Overlay for mobile */}

      {open && (

        <div

          onClick={() => setOpen(false)}

          className="fixed inset-0 bg-black/40 md:hidden"

        />

      )}

    </>

  );

};



export default Sidebar;