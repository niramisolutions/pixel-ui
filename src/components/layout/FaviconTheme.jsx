"use client";

import { useEffect } from "react";

/**
 * Swaps the favicon when the browser's colour scheme changes.
 *
 * The `prefers-color-scheme` query inside icon.svg only resolves at fetch time —
 * browsers rasterize the favicon once and cache the bitmap, so flipping the OS or
 * browser theme leaves the stale colour on the tab until a reload. Pointing the
 * link at a different file forces a re-fetch, which is the only way to repaint it
 * live (scripts inside a favicon SVG are blocked).
 *
 * icon.svg stays the no-JS fallback; these single-fill copies are what the tab
 * actually shows once this mounts.
 */
const ICONS = {
  light: "/icon-light.svg",
  dark: "/icon-dark.svg",
};

export default function FaviconTheme() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const href = query.matches ? ICONS.dark : ICONS.light;

      // Replace the node instead of just reassigning href: mutating href alone
      // is unreliable in Chrome, and leaving the old link in place (including
      // the one Next injects for app/icon.svg) means the browser may keep
      // painting whichever icon it resolved first.
      document
        .querySelectorAll('link[rel~="icon"]')
        .forEach((stale) => stale.parentNode?.removeChild(stale));

      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.href = href;
      document.head.appendChild(link);
    };

    apply();
    query.addEventListener("change", apply);

    return () => query.removeEventListener("change", apply);
  }, []);

  return null;
}
