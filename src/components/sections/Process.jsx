import {
  ChevronRight,
  ClipboardList,
  Gauge,
  Hammer,
  Search,
} from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import NeonCubeGridBackground from "@/components/three/NeonCubeGrid/lazy";

const STEPS = [
  {
    number: 1,
    title: "Discover",
    icon: Search,
    items: [
      "Business Discovery",
      "Technical Assessment",
      "Stakeholder Workshops",
      "Opportunity Analysis",
    ],
  },
  {
    number: 2,
    title: "Plan",
    icon: ClipboardList,
    items: [
      "Solution Architecture",
      "Project Roadmap",
      "Technical Planning",
      "Risk Assessment",
    ],
  },
  {
    number: 3,
    title: "Build",
    icon: Hammer,
    items: [
      "UI/UX Design",
      "Software Development",
      "AI Integration",
      "Quality Assurance",
      "Cloud Deployment",
    ],
  },
  {
    number: 4,
    title: "Optimize",
    icon: Gauge,
    items: [
      "Performance Monitoring",
      "Analytics Optimization",
      "Maintenance",
      "Continuous Improvement",
    ],
  },
];

export default function Process() {
  return (
    <section
      id="process"  
      aria-labelledby="process-heading"
      className="relative overflow-hidden border-b border-white/10 bg-gradient-dark px-6 py-24 lg:px-16"
    >
      {/* the neon grid keeps its cubes hidden until hovered, so the line grid sits on top of it
          to give the glass cards structure to blur against even at rest */}
      <NeonCubeGridBackground className="z-0" />
      {/* <div
        className="pointer-events-none absolute inset-0 z-1 bg-line-grid"
        aria-hidden
      /> */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-14">
        <SectionHeading
          id="process-heading"
          tone="dark"
          title="Our Proven Delivery Process"
          description="A structured methodology designed to reduce risk, improve collaboration, and deliver measurable business outcomes."
        />

        {/* ordered list: the sequence is the point, so let assistive tech announce it as one.
            No panels — each step is an open "T": a neon rail carrying a hexagonal node, with a
            spine dropping from it and each deliverable branching off as a tick. Nothing is
            boxed, so the cube grid stays visible everywhere except behind the text itself.
            The rail overshoots into the gutter by exactly half of gap-x-8, which is what makes
            the four segments read as one unbroken line at lg. */}
        <ol className="relative grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === STEPS.length - 1;

            return (
              <li
                key={step.title}
                className="group relative isolate pt-16 [text-shadow:0_1px_10px_rgba(3,12,10,0.9)]"
              >
                {/* legibility wash. Masked on all four sides rather than clipped, so there is
                    no hard edge against the animated grid — this is what replaces the panel. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-x-6 top-9 -bottom-8 bg-[linear-gradient(180deg,rgba(4,16,13,0)_0%,rgba(4,16,13,0.82)_9%,rgba(4,16,13,0.74)_58%,rgba(4,16,13,0)_100%)] [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
                />

                {/* brightest at the left, where the node clamps on, then falling away toward
                    the next step — the line reads as signal travelling along the process */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-4 -right-4 top-7 h-px bg-[linear-gradient(90deg,rgba(194,249,106,0.14)_0%,rgba(194,249,106,0.5)_9%,rgba(194,249,106,0.34)_62%,rgba(194,249,106,0.12)_92%,transparent_100%)]"
                />

                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-10 top-7 h-16 w-40 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(194,249,106,0.18),transparent)] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                />

                {/* hex node: an accent-gradient shell with an ink core punched out of it, so the
                    edge lights up without a border and the icon still sits on solid ground */}
                <span
                  aria-hidden
                  className="absolute top-1.5 left-0 grid size-11 place-items-center bg-[linear-gradient(155deg,#ddff8c,#34d399)] transition-transform duration-300 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] [filter:drop-shadow(0_0_14px_rgba(194,249,106,0.35))] group-hover:scale-[1.08]"
                >
                  <span className="absolute inset-[1.25px] bg-[linear-gradient(155deg,#0b241d,#061713)] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]" />
                  <Icon className="relative size-5 text-accent-soft" strokeWidth={1.75} />
                </span>

                <span className="absolute top-[1.45rem] left-14 -translate-y-full text-[0.7rem] font-bold tracking-[0.22em] tabular-nums text-accent/85">
                  {String(step.number).padStart(2, "0")}
                  {/* sits above the wash, so it is measured against the raw section
                      background: /55 clears 4.5:1 where /45 came in at 3.8:1 */}
                  <span className="text-white/55" aria-hidden>
                    /{String(STEPS.length).padStart(2, "0")}
                  </span>
                </span>

                {/* the spine fades out rather than stopping, so the item has no bottom edge */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-13 bottom-4 left-5.5 w-px bg-[linear-gradient(180deg,rgba(194,249,106,0.5)_0%,rgba(194,249,106,0.22)_45%,rgba(194,249,106,0)_100%)]"
                />

                <div className="relative pl-11">
                  <h3 className="text-card-title text-paper">{step.title}</h3>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {step.items.map((item) => (
                      <li
                        key={item}
                        className="relative text-[0.9375rem] leading-snug text-white/80"
                      >
                        <span
                          aria-hidden
                          className="absolute top-[0.62rem] -left-5.5 h-px w-3.5 bg-[linear-gradient(90deg,rgba(194,249,106,0.6),rgba(194,249,106,0.08))]"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {!isLast ? (
                  <>
                    {/* stacked view has no shared rail, so bridge down to the next node */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute top-full left-5.5 h-12 w-px bg-[linear-gradient(180deg,rgba(194,249,106,0)_0%,rgba(194,249,106,0.4)_100%)] sm:hidden"
                    />
                    <ChevronRight
                      aria-hidden
                      className="absolute top-7 -right-6 hidden size-4 -translate-y-1/2 text-accent/55 [filter:drop-shadow(0_0_5px_rgba(4,16,13,0.95))] lg:block"
                    />
                  </>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
