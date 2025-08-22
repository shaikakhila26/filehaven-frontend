import React, { useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";

/**
 * Advanced Search Modal (focus-trapped, accessible)
 * Props:
 * - open, onClose
 * - value: { type, owner, itemName, location, inTrash, starred, encrypted, sortBy, sortOrder }
 * - onChange(next)
 * - onSubmit()
 * - disableHasWords & removeLearnMore already applied (per your instruction)
 */
export default function AdvancedSearchModal({ open, onClose, value, onChange, onSubmit ,onReset }) {
  const ref = useRef(null);
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  // Focus trap
  useEffect(() => {
    if (!open) return;
    const modal = ref.current;
    const focusable = modal?.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    first?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const update = (patch) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange?.(next);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-2 sm:p-4" 
     aria-modal="true" 
     role="dialog" 
     aria-label="Advanced search">
  <div
    ref={ref}
    className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl 
               w-full h-full sm:h-auto sm:max-w-md 
               mx-auto border border-gray-200 dark:border-zinc-700 
               flex flex-col overflow-y-auto"
  >
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
      <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">Advanced search</h2>
      <button
        onClick={onClose}
        className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
        aria-label="Close advanced search"
      >
        <MdClose className="text-xl" />
      </button>
    </div>

    {/* Body */}
    <div className="p-4 space-y-4 flex-1">
      {/* (your form fields unchanged) */}
    </div>

    {/* Footer */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 p-4 
                    border-t border-gray-200 dark:border-zinc-700 
                    bg-gray-50 dark:bg-zinc-700/40">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 rounded-md w-full sm:w-auto"
      >
        Cancel
      </button>
      <button
        onClick={onReset}
        className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md w-full sm:w-auto"
      >
        Reset
      </button>
      <button
        onClick={onSubmit}
        className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md w-full sm:w-auto"
      >
        Search
      </button>
    </div>
  </div>
</div>

  );
}