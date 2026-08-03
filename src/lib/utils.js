import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The project's typography utilities (src/styles/typography.css) are named text-*, which
// tailwind-merge otherwise reads as text-colour utilities — so cn("text-section-title",
// "text-ink") would collapse to just "text-ink" and silently drop the type styles.
// Registering them as font-size utilities makes them conflict only with each other and
// with Tailwind's own text sizes, which is what they actually are.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "section-title",
            "section-subtitle",
            "lead",
            "card-title",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
