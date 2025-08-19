import React, { useState } from "react";
import FileVersionList from "../components/FileVersionList";

function FileListWithContextMenu({ files }) {
  // State to track context menu info: position and which file was right-clicked
  const [contextMenu, setContextMenu] = useState(null); // {x, y, fileId} or null
  const [versionFileId, setVersionFileId] = useState(null); // ID of file for version UI modal

  // Prevent default context menu, show custom menu with file info
  const onContextMenu = (e, fileId) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      fileId,
    });
  };

  // Close context menu on click outside or elsewhere
  const closeContextMenu = () => setContextMenu(null);

  // Handle "Manage Versions" click: open modal and close context menu
  const openManageVersions = () => {
    setVersionFileId(contextMenu.fileId);
    closeContextMenu();
  };

  return (
    <div onClick={closeContextMenu} style={{ position: "relative" }}>
      {/* File List */}
      <ul>
        {files.map((file) => (
          <li
            key={file.id}
            onContextMenu={(e) => onContextMenu(e, file.id)}
            style={{ padding: "8px", userSelect: "none", cursor: "default" }}
          >
            {file.name}
          </li>
        ))}
      </ul>

      {/* Custom Context Menu */}
      {contextMenu && (
        <ul
          style={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: "white",
            border: "1px solid gray",
            padding: "5px 10px",
            margin: 0,
            listStyle: "none",
            zIndex: 1000,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            borderRadius: 4,
            minWidth: 140,
          }}
        >
          <li
            style={{ cursor: "pointer", padding: "6px 0" }}
            onClick={openManageVersions}
            tabIndex="0"
            onKeyDown={(e) => e.key === "Enter" && openManageVersions()}
          >
            Manage Versions
          </li>
          {/* Add more context menu items if needed */}
        </ul>
      )}

      {/* Modal for Versions List */}
      {versionFileId && (
        <div
          onClick={() => setVersionFileId(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
              width: 600,
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 0 15px rgba(0,0,0,0.3)",
            }}
          >
            <button
              onClick={() => setVersionFileId(null)}
              style={{ float: "right", marginBottom: 10 }}
            >
              Close
            </button>
            <FileVersionList fileId={versionFileId} />
          </div>
        </div>
      )}
    </div>
  );
}

export default FileListWithContextMenu;
