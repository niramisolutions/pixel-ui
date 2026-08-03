"use client";

import { useEffect, useRef } from "react";
import { BarChart3, Building2, Handshake, ShieldCheck, Sparkles, Users } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const REASONS = [
  {
    title: "Enterprise-Grade Engineering",
    description: "Secure, scalable, cloud-native architectures designed for long-term growth.",
    icon: Building2,
  },
  {
    title: "Human-Centered Design",
    description: "Technology that prioritizes usability, accessibility, and exceptional user experiences.",
    icon: Users,
  },
  {
    title: "AI-First Innovation",
    description: "Practical AI solutions that automate operations and improve efficiency without unnecessary complexity.",
    icon: Sparkles,
  },
  {
    title: "Data-Driven Decisions",
    description: "Advanced analytics and reporting that empower smarter business strategies.",
    icon: BarChart3,
  },
  {
    title: "Security by Design",
    description: "Cybersecurity best practices integrated throughout every stage of development.",
    icon: ShieldCheck,
  },
  {
    title: "Long-Term Partnership",
    description: "We remain invested beyond launch with ongoing optimization, support, and continuous improvement.",
    icon: Handshake,
  },
];

export default function WhyChooseUs() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const cardRefs = useRef([]);

  cardRefs.current = [];
  const registerCard = (el) => {
    if (el) cardRefs.current.push(el);
  };

  // gsap + ScrollTrigger are imported lazily and only once this section is approached. Loaded
  // statically they sat in the initial bundle — roughly 50KB gzip of parse and execute on the
  // critical path — for an effect that cannot run until the user has scrolled most of the page.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // The whole effect is desktop/tablet only, so phones never pay for the import at all.
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    let cancelled = false;
    let revert;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        import("@/lib/gsap").then(({ gsap }) => {
          if (cancelled) return;
          const mm = gsap.matchMedia();

          const stackAndShuffle = () => {
            const cards = cardRefs.current;
            const grid = gridRef.current;
            if (!cards.length || !grid) return;

            const gridRect = grid.getBoundingClientRect();
            const centerX = gridRect.width / 2;
            const centerY = gridRect.height / 2;

            const offsets = cards.map((card, i) => {
              const rect = card.getBoundingClientRect();
              const cardCenterX = rect.left - gridRect.left + rect.width / 2;
              const cardCenterY = rect.top - gridRect.top + rect.height / 2;
              return {
                x: centerX - cardCenterX,
                y: centerY - cardCenterY,
                rotation: (i % 2 === 0 ? -1 : 1) * (5 + i * 2),
              };
            });

            gsap.set(cards, {
              x: (i) => offsets[i].x,
              y: (i) => offsets[i].y,
              rotation: (i) => offsets[i].rotation,
              scale: 0.85,
              zIndex: (i) => cards.length - i,
            });

            gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "+=100%",
                pin: true,
                scrub: 1.5,
                anticipatePin: 1,
              },
            }).to(cards, {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              stagger: { each: 0.08, ease: "sine.inOut" },
              ease: "sine.out",
            });
          };

          mm.add("(min-width: 768px) and (max-width: 1023.98px)", stackAndShuffle);
          mm.add("(min-width: 1024px)", stackAndShuffle);
          revert = () => mm.revert();
        });
      },
      // far enough ahead that the chunk has landed before the pin engages
      { rootMargin: "600px" },
    );

    observer.observe(section);

    return () => {
      cancelled = true;
      observer.disconnect();
      revert?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-pixelui"
      aria-labelledby="why-pixelui-heading"
      className="border-b border-border bg-surface px-6 py-24 lg:px-16"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        <SectionHeading id="why-pixelui-heading" title="Why Organizations Choose PixelUI" />

        <div ref={gridRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((reason, index) => (
            <div
              key={reason.title}
              ref={registerCard}
              data-index={index}
              className="flex h-full flex-col overflow-hidden rounded-2xl border p-8 border-border bg-surface-strong shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)]"
            >
              <span className="flex size-13 items-center justify-center rounded-2xl border border-border bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)]">
                <reason.icon className="size-6 text-ink" aria-hidden />
              </span>
              <div className="flex flex-1 flex-col mt-5 gap-2">
                <h3 className="text-card-title text-ink">{reason.title}</h3>
                <p className="text-base text-muted">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
