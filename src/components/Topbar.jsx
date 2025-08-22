// src/components/topbar.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from "react";
import { FaSearch, FaCog, FaBell } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { retryFetch } from "../utils/retryFetch";
import useLRUCache from "../hooks/useLRUCache";
import ToastProvider, { useToast } from "../context/ToastContext";
import ThemeProvider from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const SearchResults = lazy(() => import("./search/SearchResults"));
const AdvancedSearchModal = lazy(() => import("./search/AdvancedSearchModal"));
const NotificationsPanel = lazy(() => import("./notifications/NotificationsPanel"));

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Debounce util
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

function TopbarInner() {
  const { push } = useToast();
  const navigate = useNavigate();

  // theme
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;
  });
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const lru = useLRUCache(120); // a bit larger cache

  const [userData, setUserData] = useState({
    name: "User",
    email: "user@filehaven.com",
    avatar: null,
    initials: "U",
    storageUsed: 0,
    storageTotal: 15 * 1024 * 1024 * 1024,
    filesCount: 0,
    foldersCount: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [searchResults, setSearchResults] = useState({ files: [], folders: [] });

  // basic filter strip (kept minimal)
  const [searchFilters, setSearchFilters] = useState({ fileType: "", minSize: "", maxSize: "" });

  // Advanced search (includes sorting controls)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advanced, setAdvanced] = useState({
    type: "",
    owner: "",
    itemName: "",
    location: "",
    inTrash: false,
    starred: false,
    encrypted: false,
    sortBy: "name",
    sortOrder: "asc",
  });

  const ADVANCED_DEFAULT = useMemo(() => ({
  type: "",
  owner: "",
  itemName: "",
  location: "",
  inTrash: false,
  starred: false,
  encrypted: false,
  sortBy: "name",
  sortOrder: "asc",
}), []);

  // Notifications & menus
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [token, setToken] = useState(null);

  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const settingsRef = useRef(null);
  const userMenuRef = useRef(null);

  // NEW: abort controllers for in-flight searches
  const filesAbortRef = useRef(null);
  const foldersAbortRef = useRef(null);

  // --- helpers
  const formatFileSize = (bytes) => {
    if (bytes === 0 || bytes == null) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  const getStoragePercentage = () =>
    userData.storageTotal ? Math.round((userData.storageUsed / userData.storageTotal) * 100) : 0;

  // --- Initial profile
  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);

    const fetchProfile = () =>
      fetch(`${VITE_API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      });

    retryFetch(fetchProfile, { retries: 2 })
      .then(async (res) => {
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) throw new Error("Backend not JSON");
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setBackendConnected(true);
        setUserData({
          name: data.user?.name || data.user?.email?.split("@")[0] || "User",
          email: data.user?.email || "user@filehaven.com",
          avatar: data.user?.avatar_url || null,
          initials: (data.user?.name || data.user?.email || "User").charAt(0).toUpperCase(),
          storageUsed: data.storage?.used || 0,
          storageTotal: data.storage?.total || 15 * 1024 * 1024 * 1024,
          filesCount: data.stats?.filesCount || 0,
          foldersCount: data.stats?.foldersCount || 0,
        });
      })
      .catch(() => {
        setBackendConnected(false);
        push("Backend connection failed. Using local token info if available.", "error");
        if (t) {
          try {
            const payload = JSON.parse(atob(t.split(".")[1]));
            setUserData((prev) => ({
              ...prev,
              name: payload.name || payload.email?.split("@")[0] || "User",
              email: payload.email || "user@filehaven.com",
              initials: (payload.name || payload.email || "User").charAt(0).toUpperCase(),
            }));
          } catch {}
        }
      });
  }, [push]);

  // Notifications (initial)
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`${VITE_API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error(`status ${r.status}`);
        const ct = r.headers.get("content-type") || "";
        const d = ct.includes("application/json") ? await r.json() : {};
        const notifications = Array.isArray(d) ? d : d?.notifications || [];
        const count = typeof d?.unreadCount === "number"
          ? d.unreadCount
          : notifications.filter((n) => !(n.seen || n.read)).length;
        setUnreadCount(count);
      } catch {
        // noop
      }
    })();
  }, [token]);

  // ---- search param builders
  const buildBasicParams = (q, pageNum = 1) => {
    const p = new URLSearchParams({
      query: q,
      page: String(pageNum),
      pageSize: "10",
      sortBy: "name",
      sortOrder: "asc",
    });
    if (searchFilters.fileType) p.set("fileType", searchFilters.fileType);
    // (minSize/maxSize omitted server-side for simplicity, keep client-side filtering if needed)
    return p.toString();
  };

  const buildAdvancedParams = (pageNum = 1) => {
    const p = new URLSearchParams({
      query: advanced.itemName || "",
      sortBy: advanced.sortBy,
      sortOrder: advanced.sortOrder,
      page: String(pageNum),
      pageSize: "20",
    });
    if (advanced.type) p.set("fileType", advanced.type);
    if (advanced.owner) p.set("owner", advanced.owner);
    if (advanced.location) p.set("location", advanced.location);
    if (advanced.inTrash) p.set("inTrash", "true");
    if (advanced.starred) p.set("starred", "true");
    if (advanced.encrypted) p.set("encrypted", "true");
    return p.toString();
  };

  // core fetcher (with caching + abort)
  const fetchSearch = useCallback(
    async ({ q, pageNum = 1, mode = "basic" }) => {
      if (!q?.trim() && mode === "basic") return { files: [], folders: [], hasMore: false };
      if (!backendConnected) {
        setShowSearchResults(true);
        setIsSearching(false);
        return { files: [], folders: [], hasMore: false };
      }

      const cacheKey = JSON.stringify({ mode, q, pageNum, searchFilters, advanced });
      const cached = lru.get(cacheKey);
      if (cached) return cached;

      // Abort any in-flight
      filesAbortRef.current?.abort();
      foldersAbortRef.current?.abort();
      filesAbortRef.current = new AbortController();
      foldersAbortRef.current = new AbortController();

      setIsSearching(true);
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const params = mode === "advanced" ? buildAdvancedParams(pageNum) : buildBasicParams(q, pageNum);

      const [filesResponse, foldersResponse] = await Promise.all([
        fetch(`${VITE_API_URL}/search/files?${params}`, { headers, signal: filesAbortRef.current.signal }),
        fetch(`${VITE_API_URL}/search/folders?${params}`, { headers, signal: foldersAbortRef.current.signal }),
      ]);

      const files = filesResponse.ok && filesResponse.headers.get("content-type")?.includes("application/json")
        ? (await filesResponse.json())
        : { results: [], hasMore: false };

      const folders = foldersResponse.ok && foldersResponse.headers.get("content-type")?.includes("application/json")
        ? (await foldersResponse.json())
        : { results: [], hasMore: false };

      const out = {
        files: files.results || [],
        folders: folders.results || [],
        hasMore: Boolean(files.hasMore || folders.hasMore),
      };

      lru.set(cacheKey, out);
      setIsSearching(false);
      setBackendConnected(true);
      return out;
    },
    [VITE_API_URL, advanced, backendConnected, lru, searchFilters, token]
  );

  // Debounced basic search
  const debouncedSearch = useMemo(
  () =>
    debounce(async (q) => {
      setPage(1);
      try {
        const out = await fetchSearch({ q, pageNum: 1, mode: "basic" });
        setSearchResults(out);
        setHasMore(out.hasMore);
        setShowSearchResults(true);
      } catch (err) {
        if (err.name === "AbortError") {
          // Ignore aborted requests
          return;
        }
        setIsSearching(false);
        setBackendConnected(false);
        push("Search failed. Check backend.", "error");
      }
    }, 300),
  [fetchSearch, push]
);


  const handleSearchInput = (value) => {
    setSearchQuery(value);
    if (value.trim()) debouncedSearch(value);
    else {
      filesAbortRef.current?.abort();
      foldersAbortRef.current?.abort();
      setSearchResults({ files: [], folders: [] });
      setShowSearchResults(false);
    }
  };

  const loadMore = async () => {
    const next = page + 1;
    const out = await fetchSearch({ q: searchQuery, pageNum: next, mode: "basic" }).catch(() => null);
    if (!out) return;
    setPage(next);
    setSearchResults({
      files: [...(searchResults.files || []), ...out.files],
      folders: [...(searchResults.folders || []), ...out.folders],
    });
    setHasMore(out.hasMore);
  };

  // Advanced search submit
 const performAdvancedSearch = async () => {
  setShowAdvancedSearch(false);
  setShowSearchResults(true);
  setIsSearching(true);
  setPage(1);

  try {
    const out = await fetchSearch({ q: advanced.itemName || "", pageNum: 1, mode: "advanced" });
    setSearchResults(out);
    setHasMore(out.hasMore);
  } catch (err) {
    if (err.name === "AbortError") {
      return;
    }
    setBackendConnected(false);
    push("Advanced search failed. Check backend.", "error");
  } finally {
    setIsSearching(false);
  }
};


  // Click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchResults(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setShowNotifications(false);
      if (settingsRef.current && !settingsRef.current.contains(event.target)) setShowSettings(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      filesAbortRef.current?.abort();
      foldersAbortRef.current?.abort();
    };
  }, []);

  const handleLogout = async () => {
    try {
      if (token) {
        await fetch(`${VITE_API_URL}/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
      }
    } catch {}
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

 const openItem = async (item) => {
    if (!item) return;

    if (item._kind === "folder"|| item.type==="folder") {
      // 👉 Redirect to MyDrive with folder id
      navigate("/dashboard/mydrive",{
          state: { folderId: item.id } // pass the folder ID
    });
        
    } else if (item._kind === "file"|| item.type === "file") {

          
    
      try {
        const res = await fetch(`${API_BASE}/files/${item.id}/download`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.url) {
          window.open(data.url, "_blank");
        }
      } catch (err) {
        console.error("Error opening file:", err);
        // 👉 fallback: redirect to MyDrive view
        navigate(`/mydrive?file=${item.id}`);
      }
    }
  };


 return (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-2 sm:py-3 bg-white dark:bg-zinc-700 border-b border-gray-200 dark:border-zinc-900 gap-2 sm:gap-0">
    {/* Left: Brand + Search (stacked on mobile, inline on desktop) */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 flex-1">
      {/* Brand */}
      <div className="flex items-center gap-2 sm:gap-3" aria-label="FileHaven brand">
        <img src="/logo.jpg" alt="FileHaven Logo" className="h-7 sm:h-8 rounded-lg" />
        <span className="text-lg sm:text-xl font-normal text-gray-700 dark:text-zinc-100">
          FileHaven
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-full sm:max-w-xl relative" ref={searchRef}>
        <div className="relative">
          <FaSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            role="combobox"
            aria-expanded={showSearchResults}
            aria-controls="fh-search-results"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => searchQuery && setShowSearchResults(true)}
            className="w-full pl-10 sm:pl-12 pr-24 sm:pr-32 py-2 sm:py-3 text-sm sm:text-base bg-gray-100 dark:bg-zinc-900 rounded-full focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:shadow-md transition-all duration-200 text-gray-700 dark:text-zinc-100"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => setShowAdvancedSearch(true)}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 dark:text-zinc-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-full transition-all duration-200 border border-gray-300 dark:border-zinc-700 hover:border-blue-300"
            >
              Advanced
            </button>

            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                  setSearchResults({ files: [], folders: [] });
                  filesAbortRef.current?.abort();
                  foldersAbortRef.current?.abort();
                }}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-full"
                aria-label="Clear search"
              >
                <MdClose />
              </button>
            )}
          </div>
        </div>

        {showSearchResults && (
          <Suspense fallback={<div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow p-4">Loading…</div>}>
            <SearchResults
              query={searchQuery}
              results={searchResults}
              isSearching={isSearching}
              backendConnected={backendConnected}
              onLoadMore={loadMore}
              hasMore={hasMore}
              onItemOpen={openItem}
            />
          </Suspense>
        )}
      </div>
    </div>

    {/* Right: Actions */}
    <div className="flex items-center justify-end gap-1 sm:gap-2 mt-2 sm:mt-0">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="hidden sm:flex items-center p-2 text-sm sm:text-base hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* Notifications */}
      <div className="relative" ref={notificationsRef}>
        <button
          onClick={() => setShowNotifications((v) => !v)}
          className="p-2 sm:p-3 text-gray-600 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-400 rounded-full relative"
        >
          <FaBell className="text-lg sm:text-xl" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 sm:h-5 w-4 sm:w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute top-full right-0 mt-2 w-64 sm:w-80 bg-white dark:bg-zinc-700 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 z-50">
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-zinc-700">
              <h3 className="font-medium text-gray-900 dark:text-zinc-100 text-sm sm:text-base">
                Notifications
              </h3>
            </div>
            <Suspense fallback={<div className="p-3 sm:p-4 text-center text-gray-500">Loading…</div>}>
              <NotificationsPanel
                apiBase={VITE_API_URL}
                token={token}
                onConnectedChange={(ok) => {
                  if (!ok) setBackendConnected(false);
                }}
                onUnreadChange={(count) => setUnreadCount(count)}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* User menu (unchanged, just shrinks) */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setShowUserMenu((v) => !v)}
          className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center rounded-full font-medium text-xs sm:text-sm cursor-pointer hover:shadow-md"
        >
          {userData.avatar ? (
            <img src={userData.avatar || "/placeholder.svg"} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span>{userData.initials}</span>
          )}
        </button>

        {showUserMenu && (
          <div className="absolute top-full right-0 mt-2 w-64 sm:w-80 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700 z-50">
            {/* keep user menu body same, Tailwind will auto scale */}
          </div>
        )}
      </div>
    </div>
  </div>
);

}

export default function Topbar() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TopbarInner />
      </ToastProvider>
    </ThemeProvider>
  );
}