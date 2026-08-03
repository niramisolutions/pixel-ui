"use client";

import { useId, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MetaballButton({ href, children, className, onClick, ...props }) {
  const filterId = `metaball-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const blobRef = useRef(null);
  const iconRef = useRef(null);
  const timelineRef = useRef(null);

  const setHovered = (hovered) => {
    timelineRef.current?.kill();
    timelineRef.current = gsap
      .timeline()
      .to(
        blobRef.current,
        {
          scale: hovered ? 1 : 0,
          x: hovered ? 22 : 0,
          duration: hovered ? 0.7 : 0.4,
          ease: hovered ? "elastic.out(1, 0.5)" : "power3.inOut",
        },
        0,
      )
      .to(
        iconRef.current,
        {
          x: hovered ? 26 : 0,
          duration: hovered ? 0.7 : 0.4,
          ease: hovered ? "elastic.out(1, 0.5)" : "power3.inOut",
        },
        hovered ? 0.08 : 0,
      );
  };

  const Comp = href ? Link : "button";

  return (
    <Comp
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2.5 rounded-md px-4 py-4 text-xs font-medium whitespace-nowrap text-accent active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong",
        className,
      )}
      {...props}
    >
      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>

      <span
        aria-hidden
        className="absolute inset-0 rounded-md bg-ink transition-colors duration-200 group-hover:bg-ink/90"
        style={{ filter: `url(#${filterId})` }}
      >
        <span
          ref={blobRef}
          className="absolute top-1/2 right-3 size-5 -translate-y-1/2 scale-0 rounded-full bg-ink"
        />
      </span>

      <span className="relative z-10">{children}</span>
      <span ref={iconRef} className="relative z-10 inline-flex">
        <ArrowRight className="size-4.5" aria-hidden />
      </span>
    </Comp>
  );
}
