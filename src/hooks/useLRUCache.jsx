// src/hooks/useLRUCache.js
import { useRef } from "react";

export default function useLRUCache(max = 100) {
  const mapRef = useRef(new Map());

  const get = (key) => {
    const m = mapRef.current;
    if (!m.has(key)) return null;
    const val = m.get(key);
    // refresh LRU
    m.delete(key);
    m.set(key, val);
    return val;
    };
  const set = (key, val) => {
    const m = mapRef.current;
    if (m.has(key)) m.delete(key);
    m.set(key, val);
    // trim
    while (m.size > max) {
      const firstKey = m.keys().next().value;
      m.delete(firstKey);
    }
  };
  const clear = () => mapRef.current.clear();

  return { get, set, clear };
}
