import React, { useState, useRef } from "react";
import FileVersionList from "./FileVersionList";

function FileListWithContextMenu({ files }) {
  const [contextMenu, setContextMenu] = useState(null); // {x, y, fileId} or null
  const [versionFileId, setVersionFileId] = useState(null);

  const onContextMenu = (e, fileId) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      fileId,
    });
  };

  const closeContextMenu = () => setContextMenu(null);
  const openManageVersions = () => {
    setVersionFileId(contextMenu.fileId);
    closeContextMenu();
  };

  return (
    <div onClick={closeContextMenu} style={{ position: "relative" }}>
      <ul>
        {files.map((file) => (
          <li key={file.id} onContextMenu={(e) => onContextMenu(e, file.id)}>
            {file.name}
          </li>
        ))}
      </ul>

      {contextMenu && (
        <ul
          style={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: "white",
            border: "1px solid gray",
            listStyle: "none",
            padding: "5px 10px",
            zIndex: 1000,
          }}
        >
          <li style={{ cursor: "pointer" }} onClick={openManageVersions}>
            Manage Versions
          </li>
          {/* Add more menu items if needed */}
        </ul>
      )}

      {/* Modal or drawer for version list */}
      {versionFileId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
          }}
          onClick={() => setVersionFileId(null)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", padding: 20 }}>
            <button onClick={() => setVersionFileId(null)} style={{ float: "right" }}>
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
