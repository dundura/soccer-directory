"use client";

import { useEffect, useRef, useState } from "react";

// Drop-in replacement for useState + localStorage.getItem/setItem, backed by
// a database-persisted key-value store (survives cache clears, works across
// devices/browsers) instead of the browser's local storage.
export function usePersistedState<T>(key: string, defaultValue: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const loaded = useRef(false);

  useEffect(() => {
    fetch(`/api/focus/app-state?key=${encodeURIComponent(key)}`)
      .then((res) => res.json())
      .then((data: { value: T | null }) => {
        if (data.value !== null && data.value !== undefined) setValue(data.value);
        loaded.current = true;
      })
      .catch(() => { loaded.current = true; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      fetch("/api/focus/app-state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: resolved }),
      }).catch(() => {});
      return resolved;
    });
  };

  return [value, update];
}
