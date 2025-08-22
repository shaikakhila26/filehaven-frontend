import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = ({ children, onNewClick, storage }) => {
  return (
    <div className="flex h-screen">
      <Sidebar onNewClick={onNewClick} storage={storage} />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="p-6 bg-gray-50 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;