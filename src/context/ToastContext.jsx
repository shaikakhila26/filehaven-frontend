import React, { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, type = "info") => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-[2000]" role="status" aria-live="polite">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded shadow text-sm 
              ${t.type === "error" ? "bg-red-600 text-white" :
                 t.type === "success" ? "bg-green-600 text-white" :
                 "bg-gray-900 text-white"}`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
