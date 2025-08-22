import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = ({ children, onNewClick, storage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-blue-700 text-white transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNewClick={onNewClick} storage={storage} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 md:p-6 bg-gray-50 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
