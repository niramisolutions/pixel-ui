"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/constants/navigation";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useMagnetic } from "@/hooks/useMagnetic";
import { cn } from "@/lib/utils";

// Hoisted so its identity is stable across renders — useActiveSection keys its observer on it.
const SECTION_IDS = NAV_LINKS.filter((link) => link.href.startsWith("#")).map(
  (link) => link.href.slice(1),
);

export default function Header() {
  const [open, setOpen] = useState(false);
  const activeId = useActiveSection(SECTION_IDS);
  // "Home" owns the top of the page, where no section has reached the header yet.
  const isActive = (href) =>
    href === "/" ? activeId === null : href === `#${activeId}`;
  const magneticRef = useMagnetic();
  const magneticRefMobile = useMagnetic(0.25);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-6 py-3 lg:px-16">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo priority />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center gap-8 lg:ml-10 lg:flex"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                data-label={link.label}
                className={cn(
                  "py-1 text-base tracking-tight transition-colors",
                  // Bold is wider than regular, so every change of active link would otherwise
                  // resize a label and shuffle the whole row. The hidden zero-height ::after
                  // carries the same text at the bold weight, pinning each link to its bold
                  // width permanently — the row cannot move.
                  "after:invisible after:block after:h-0 after:overflow-hidden after:font-semibold after:content-[attr(data-label)]",
                  active ? "font-semibold text-ink" : "text-ink/55 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div ref={magneticRef} className="hidden lg:inline-block">
          <Button href="#contact" variant="dark" icon={ArrowRight}>
            Schedule Consultation
          </Button>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-md border border-ink/10 p-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Toggle navigation menu</span>
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="flex flex-col gap-1 border-t border-ink/10 px-6 py-4 lg:hidden"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2 py-2 text-base transition-colors",
                  active
                    ? "font-semibold text-ink"
                    : "text-ink/60 hover:bg-ink/5 hover:text-ink",
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <div ref={magneticRefMobile} className="mt-2">
            <Button
              href="#contact"
              variant="dark"
              icon={ArrowRight}
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Schedule Consultation
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
