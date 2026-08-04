"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Source clips were 2880x2160 / ~4MB each; re-encoded to 1280x960 and paired with VP9, which
// is what the <source> order below is for. Only the active item is ever mounted, so at most
// one video is in memory and nothing but the default image is fetched on first load.
const MEDIA = [
  {
    id: "logistics",
    type: "image",
    label: "Logistics Platform",
    src: "/media/logistics.jpg",
    thumb: "/media/logistics-thumb.webp",
    // lg+ only: below that the stage spans the whole container, so there is no gutter to
    // float in and the chips sit in a wrapped row underneath instead.
    position: "lg:top-[1%] lg:-left-[12rem] xl:-left-[14rem]",
    size: "lg:w-44",
    float: "0s",
  },
  {
    id: "clip-a",
    type: "video",
    label: "SaaS Platform",
    src: "/media/clip-a",
    poster: "/media/clip-a-poster.jpg",
    thumb: "/media/clip-a-thumb.webp",
    position: "lg:top-[13%] lg:-right-[13rem] xl:-right-[15.5rem]",
    size: "lg:w-48",
    float: "0.9s",
  },
  {
    id: "fleet-map",
    type: "image",
    label: "Fleet Telemetry",
    src: "/media/fleet-map.jpg",
    thumb: "/media/fleet-map-thumb.webp",
    position: "lg:top-[32%] lg:-left-[11rem] xl:-left-[11.5rem]",
    size: "lg:w-40",
    float: "1.8s",
  },
  {
    id: "clip-b",
    type: "video",
    label: "Mobile Analytics",
    src: "/media/clip-b",
    poster: "/media/clip-b-poster.jpg",
    thumb: "/media/clip-b-thumb.webp",
    position: "lg:bottom-[8%] lg:-right-[12rem] xl:-right-[13rem]",
    size: "lg:w-44",
    float: "2.6s",
  },
  {
    id: "smart-home",
    type: "image",
    label: "Smart Building",
    src: "/media/smart-home.jpg",
    thumb: "/media/smart-home-thumb.webp",
    position: "lg:bottom-0 lg:-left-[12.75rem] xl:-left-[15rem]",
    size: "lg:w-48",
    float: "3.4s",
  },
];

// Pointer travel below this is a tap, not a drag — lets one handler serve mouse and touch.
const TAP_SLOP_PX = 6;

function Stage({ item, isOver, stageRef }) {
  return (
    <div
      ref={stageRef}
      className={cn(
        "relative aspect-3/2 overflow-hidden rounded-2xl border bg-ink shadow-[0px_7px_5px_0px_rgba(0,0,0,0.09),0px_40px_40px_0px_rgba(0,0,0,0.05)] transition-colors duration-200",
        isOver ? "border-accent" : "border-ink/10",
      )}
    >
      {/* keyed so swapping source restarts the fade and, for video, tears down the old element
          rather than reusing it with a new src */}
      {item.type === "video" ? (
        <video
          key={item.id}
          className="hero-fade-in size-full object-cover"
          poster={item.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          aria-label={item.label}
        >
          <source src={`${item.src}.webm`} type="video/webm" />
          <source src={`${item.src}.mp4`} type="video/mp4" />
        </video>
      ) : (
        <Image
          key={item.id}
          src={item.src}
          alt={item.label}
          fill
          sizes="(min-width: 1024px) 64rem, 100vw"
          // the default item is on screen at first paint, so let it preload rather than
          // leaving the stage empty; the rest are only reached by interaction
          priority={item.id === MEDIA[0].id}
          className="hero-fade-in object-cover"
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 bg-linear-to-t from-ink/80 to-transparent px-5 pt-10 pb-4">
        <span className="text-sm font-semibold text-paper">{item.label}</span>
        {item.type === "video" ? (
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-accent-soft">
            LIVE
          </span>
        ) : null}
      </div>

      {/* only rendered mid-drag, so it costs nothing at rest */}
      {isOver ? (
        <div className="pointer-events-none absolute inset-3 rounded-xl border-2 border-dashed border-accent/70 bg-ink/40" />
      ) : null}
    </div>
  );
}

export default function HeroDashboard() {
  const [activeId, setActiveId] = useState(MEDIA[0].id);
  const [draggingId, setDraggingId] = useState(null);
  const [isOver, setIsOver] = useState(false);

  const stageRef = useRef(null);
  // Written synchronously at the point each value is known: the window-level pointermove and
  // pointerup listeners are registered once and would otherwise close over stale state. The
  // dragged element is captured here too rather than through a ref map, so it cannot go stale
  // when the re-render from setDraggingId re-runs the ref callbacks.
  const dragRef = useRef(null);
  const overRef = useRef(false);

  const active = MEDIA.find((m) => m.id === activeId) ?? MEDIA[0];

  useEffect(() => {
    function onMove(event) {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < TAP_SLOP_PX) return;
      drag.moved = true;

      // compositor-only write; driving this through setState would re-render the hero on
      // every pointermove
      drag.node.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.06)`;
      drag.node.style.zIndex = "50";

      const rect = stageRef.current?.getBoundingClientRect();
      const over = Boolean(
        rect &&
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom,
      );
      if (over !== overRef.current) {
        overRef.current = over;
        setIsOver(over);
      }
    }

    function onUp() {
      const drag = dragRef.current;
      if (!drag) return;

      drag.node.style.transform = "";
      drag.node.style.zIndex = "";

      // a tap anywhere on a chip selects it; a drag only counts if it ended over the stage
      if (!drag.moved || overRef.current) setActiveId(drag.id);

      dragRef.current = null;
      overRef.current = false;
      setDraggingId(null);
      setIsOver(false);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const startDrag = useCallback((id, event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = {
      id,
      node: event.currentTarget,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    setDraggingId(id);
  }, []);

  return (
    // width is capped against viewport height so the 3:2 stage can never grow taller than the
    // space the hero has left; the chips are positioned against this box, so shrinking the box
    // rather than the stage alone keeps them pinned to the artwork.
    //
    // The max(26rem, …) floor is load-bearing. Without it the height term collapses on a short
    // viewport — a 844x390 phone in landscape has 390 - 63 - 320 = 7px of budget, and the stage
    // rendered 11px wide, an invisible sliver. No arrangement of headline + lead + buttons + a
    // 3:2 image fits 390px of height, so the honest trade is to hold the stage at a readable
    // size and let the hero scroll on those viewports.
    <div className="relative mx-auto mt-6 w-full max-w-[min(64rem,max(26rem,calc((100svh-var(--header-h)-var(--hero-chrome))*1.5)))]">
      <Stage item={active} isOver={isOver} stageRef={stageRef} />

      {/* one set of chips for both layouts: a single scrolling row under the stage on phones
          (three wrapped rows cost ~190px of an 844px screen), scattered around it from md up */}
      {/* wrapped and centred rather than a scroll strip, so five chips read as 3 over 2 and
          nothing is hidden off-screen; from lg they leave the flow for the side gutters */}
      <div className="mx-auto mt-3 flex max-w-80 flex-wrap justify-center gap-2 sm:max-w-none sm:gap-3 lg:mt-0 lg:block">
        {MEDIA.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onPointerDown={(event) => startDrag(item.id, event)}
              onDragStart={(event) => event.preventDefault()}
              aria-pressed={isActive}
              aria-label={`Show ${item.label}`}
              // the visible caption is gone, so keep the name reachable on hover as well as
              // through the accessible name
              title={item.label}
              className={cn(
                "group hero-card-idle-float relative w-20 shrink-0 touch-none overflow-hidden rounded-xl border bg-surface-strong shadow-[0px_16px_36px_-14px_rgba(8,22,18,0.45)] transition-[border-color,box-shadow] duration-300 hover:shadow-[0px_22px_46px_-12px_rgba(8,22,18,0.55)] select-none sm:w-24 md:w-28 lg:absolute",
                item.position,
                item.size,
                isActive
                  ? "border-accent ring-2 ring-accent/50"
                  : "border-ink/10 hover:border-accent/60",
                draggingId === item.id ? "cursor-grabbing" : "cursor-grab",
              )}
              style={{ animationDelay: item.float }}
            >
              {/* images are natively draggable, and letting the browser start its own drag
                  swallows every subsequent pointermove/pointerup, which kills the drop */}
              <Image
                src={item.thumb}
                alt=""
                width={480}
                height={360}
                draggable={false}
                className="aspect-3/2 w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
