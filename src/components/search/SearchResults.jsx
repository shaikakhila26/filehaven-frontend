// src/components/search/SearchResults.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MdFolder, MdInsertDriveFile } from "react-icons/md";
import { splitByQuery } from "../../utils/highlightMatch";
import { useNavigate } from "react-router-dom";



function Highlight({ text, query }) {
  const parts = useMemo(() => splitByQuery(text, query), [text, query]);
  return (
    <span>
      {parts.map((p, i) =>
        p.h ? <mark key={i} className="bg-yellow-200 rounded px-0.5">{p.t}</mark> : <span key={i}>{p.t}</span>
      )}
    </span>
  );
}

const SearchResults = React.memo(function SearchResults({
  query, results, isSearching, backendConnected, onLoadMore, hasMore, onItemOpen
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);

  const items = useMemo(() => {
    const folderItems = (results.folders || []).map(f => ({ ...f, _kind: "folder" }));
    const fileItems = (results.files || []).map(f => ({ ...f, _kind: "file" }));
    return [...folderItems, ...fileItems];
  }, [results]);

  const onKeyDown = useCallback((e) => {
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      onItemOpen?.(items[activeIndex]);
    } else if (e.key === "Escape") {
      containerRef.current?.blur();
    }
  }, [items, activeIndex, onItemOpen]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) onLoadMore?.();
    }, { root: containerRef.current, threshold: 1 });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [hasMore, onLoadMore]);

  if (!backendConnected) {
    return (
      <div className="p-4 text-center text-yellow-700">⚠️ Backend server not connected</div>
    );
  }

  return (
    <div
      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 max-h-96 overflow-y-auto z-50"
      role="listbox"
      tabIndex={0}
      onKeyDown={onKeyDown}
      ref={containerRef}
      aria-label="Search results"
    >
      {isSearching && <div className="p-4 text-center text-gray-500">Searching...</div>}

      {(!isSearching && items.length === 0) && (
        <div className="p-4 text-center text-gray-500">No results found</div>
      )}

      {(results.folders || []).length > 0 && (
        <div className="p-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">Folders</div>
          {results.folders.map((folder, idx) => {
            const i = idx;
            const isActive = activeIndex === i;
            return (
              <div
                key={folder.id}
                role="option"
                aria-selected={isActive}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer 
                  ${isActive ? "bg-blue-50 dark:bg-zinc-800" : "hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => onItemOpen?.({ ...folder, _kind: "folder" })}
              >
                <MdFolder className="text-blue-500 text-lg" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-zinc-100">
                    <Highlight text={folder.name} query={query} />
                  </div>
                  <div className="text-xs text-gray-500">Folder</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(results.files || []).length > 0 && (
        <div className="p-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">Files</div>
          {results.files.map((file, idx) => {
            const i = (results.folders?.length || 0) + idx;
            const isActive = activeIndex === i;
            return (
              <div
                key={file.id}
                role="option"
                aria-selected={isActive}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer 
                  ${isActive ? "bg-blue-50 dark:bg-zinc-800" : "hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => onItemOpen?.({ ...file, _kind: "file" })}
              >
                <MdInsertDriveFile className="text-gray-500 text-lg" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-zinc-100">
                    <Highlight text={file.name} query={query} />
                  </div>
                  <div className="text-xs text-gray-500">{formatFileSize(file.size_bytes)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div ref={sentinelRef} />
      {hasMore && !isSearching && (
        <div className="p-3 text-center text-xs text-gray-500">Loading more…</div>
      )}
    </div>
  );
});

function formatFileSize(bytes = 0) {
  if (bytes === 0 || bytes == null) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default SearchResults;
