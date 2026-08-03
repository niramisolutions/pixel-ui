import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import HeroDashboard from "@/components/sections/HeroDashboard";

// This is a Server Component. It used to be one large "use client" module, which meant the
// headline, the lead paragraph and the two buttons — all static — were shipped to the browser
// and hydrated along with the drag-and-drop dashboard. Only the dashboard needs client JS, so
// it now lives in HeroDashboard and everything above it costs zero bytes and zero hydration.

const HEADLINE_TEXT =
  "Engineering Intelligent Digital Solutions for Modern Organizations";

const HEADLINE_SEGMENTS = [
  { text: "Engineering", gradient: false },
  { text: "Intelligent", gradient: true },
  { text: "Digital Solutions for", gradient: false },
  { text: "Modern Organizations", gradient: true },
];

// Matches the GSAP tween's stagger of 0.025s per character.
const CHAR_STAGGER = 0.025;

// Characters ship pre-split in the server-rendered markup and animate via CSS, so the headline
// paints on the first frame instead of waiting for hydration + GSAP + SplitText. The animation
// is transform-only for the same reason — see hero-flip-in in animations.css.
// The h1 carries an aria-label because the per-character spans read poorly otherwise.
function FlipHeadline() {
  let charIndex = 0;

  return HEADLINE_SEGMENTS.map((segment, segmentIndex) => {
    const words = segment.text.split(" ").map((word, wordIndex) => (
      <span key={wordIndex} className="hero-flip-word">
        {Array.from(word).map((char, i) => (
          <span
            key={i}
            className="hero-flip-char"
            style={{ animationDelay: `${(charIndex++ * CHAR_STAGGER).toFixed(3)}s` }}
          >
            {char}
          </span>
        ))}
      </span>
    ));

    // real spaces between words so the headline still wraps at word boundaries
    const spaced = words.flatMap((word, i) => (i ? [" ", word] : [word]));

    return (
      <Fragment key={segmentIndex}>
        {segmentIndex > 0 ? " " : null}
        {segment.gradient ? (
          <span className="text-gradient-accent">{spaced}</span>
        ) : (
          spaced
        )}
      </Fragment>
    );
  });
}

// svh rather than vh so a mobile browser's collapsing toolbar cannot push the dashboard below
// the fold; --header-h is subtracted because the header is sticky and sits above this section.
export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-var(--header-h))] flex-col justify-center overflow-hidden border-b border-ink/10 bg-paper px-6 py-2 sm:py-6 lg:px-16">
      <div className="hero-fade-in mx-auto flex max-w-4xl flex-col items-center gap-3 text-center sm:gap-4">
        <h1
          aria-label={HEADLINE_TEXT}
          className="text-display text-balance text-ink"
        >
          <FlipHeadline />
        </h1>
        <p className="text-lead max-w-2xl text-ink/60 text-[0.875rem]! leading-snug max-sm:text-[0.78125rem]!">
          PixelUI helps organizations modernize operations through AI
          Automation, Custom SaaS Development, Data Analytics, and Managed IT
          Services building secure, scalable, and future-ready technology
          solutions.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1 sm:gap-4">
          <Button href="#contact" variant="dark" icon={ArrowRight} className="max-sm:px-3 max-sm:py-3">
            Schedule Consultation
          </Button>
          <Button href="#services" variant="secondary" className="max-sm:px-3 max-sm:py-3">
            Explore Services
          </Button>
        </div>
      </div>

      <HeroDashboard />
    </section>
  );
}
