"use client";

import { useCallback, useSyncExternalStore } from "react";

const serverSnapshot = () => false;

export function useMediaQuery(query) {
  // Both callbacks must be stable: previously `subscribe` was rebuilt on every render, so React
  // detached and reattached the change listener on each pass.
  const subscribe = useCallback(
    (callback) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", callback);
      return () => list.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
}
