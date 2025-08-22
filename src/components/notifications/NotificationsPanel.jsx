import React, { useEffect, useRef, useState } from "react";

/**
 * Realtime notifications via SSE if available; fallback to refresh button.
 * Props:
 * - apiBase
 * - token
 * - onConnectedChange(bool)
 */
export default function NotificationsPanel({ apiBase, token, onConnectedChange }) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const esRef = useRef(null);

  const fetchAll = async () => {
    const res = await fetch(`${apiBase}/notifications`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    const data = await res.json();
    setItems(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
    onConnectedChange?.(true);
  };

  useEffect(() => {
    if (!token) return;
    // Try SSE
    try {
      const es = new EventSource(`${apiBase}/notifications/stream?token=${encodeURIComponent(token)}`);
      es.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        setItems(prev => [msg, ...prev]);
        setUnreadCount(prev => prev + (msg.read ? 0 : 1));
      };
      es.onerror = () => {
        es.close();
        onConnectedChange?.(false);
      };
      esRef.current = es;
      onConnectedChange?.(true);
      // Also initial fetch
      fetchAll().catch(() => onConnectedChange?.(false));
      return () => es.close();
    } catch {
      // No SSE -> initial fetch
      fetchAll().catch(() => onConnectedChange?.false);
    }
  }, [apiBase, token, onConnectedChange]);

  const markRead = async (id, read = true) => {
    const res = await fetch(`${apiBase}/notifications/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    if (res.ok) {
      setItems(prev => prev.map(n => (n.id === id ? { ...n, read } : n)));
      setUnreadCount(prev => Math.max(0, prev + (read ? -1 : 1)));
    }
  };
 return (
    <div className="max-h-64 overflow-y-auto" aria-live="polite">
      {items.length > 0 ? (
        items.map((n) => (
          <div
            key={n.id}
            className={`p-4 border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 ${
              !n.read ? "bg-blue-50 dark:bg-zinc-800/60" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-gray-900 dark:text-zinc-100">
                {n.message}
              </p>
              <button
                className="text-xs px-2 py-1 border rounded text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
                onClick={() => markRead(n.id, !n.read)}
                aria-label={n.read ? "Mark as unread" : "Mark as read"}
              >
                {n.read ? "Unread" : "Read"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{n.time}</p>
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-gray-500 dark:text-zinc-400">
          No notifications
        </div>
      )}
    </div>
  );
}
