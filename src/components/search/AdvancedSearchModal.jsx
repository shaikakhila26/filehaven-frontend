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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" aria-modal="true" role="dialog" aria-label="Advanced search">
      <div
        ref={ref}
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200 dark:border-zinc-700"
      >
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

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">Type</label>
            <select
              value={local.type}
              onChange={(e) => update({ type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
            >
              <option value="">Any</option>
              <option value="document">Documents</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="archive">Archives</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">Owner</label>
            <select
              value={local.owner}
              onChange={(e) => update({ owner: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
            >
              <option value="">Anyone</option>
              <option value="me">Me</option>
              <option value="shared">Shared with me</option>
            </select>
          </div>

          {/* Removed "Has the words"; kept "Item name" */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">Item name</label>
            <input
              type="text"
              value={local.itemName}
              onChange={(e) => update({ itemName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
              placeholder="Part of file name"
              autoFocus={open}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">Location</label>
            <select
              value={local.location}
              onChange={(e) => update({ location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
            >
              <option value="">Anywhere</option>
              <option value="mydrive">My Drive</option>
              <option value="shared">Shared with me</option>
              <option value="recent">Recent</option>
              <option value="trash">Trash</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={local.inTrash}
                onChange={(e) => update({ inTrash: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-zinc-200">In trash</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={local.starred}
                onChange={(e) => update({ starred: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-zinc-200">Starred</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={local.encrypted}
                onChange={(e) => update({ encrypted: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-zinc-200">Encrypted</span>
            </label>
          </div>

          {/* Sort moved here; removed from inline results bar */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">Sort by</label>
              <select
                value={local.sortBy}
                onChange={(e) => update({ sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
              >
                <option value="name">Name</option>
                <option value="size_bytes">Size</option>
                <option value="created_at">Date</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-2">Order</label>
              <select
                value={local.sortOrder}
                onChange={(e) => update({ sortOrder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-700/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Reset
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
