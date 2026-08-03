import { ArrowRight, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import NeonCubeGridBackground from "@/components/three/NeonCubeGrid/lazy";

export default function CTASection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden bg-gradient-dark px-6 py-24 lg:px-16"
    >
      <NeonCubeGridBackground className="z-0" />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h2 id="cta-heading" className="text-section-title text-balance text-paper">
          Ready to Modernize Your Organization?
        </h2>
        <p className="text-lead text-white/70">
          Whether you are building a custom SaaS platform, unlocking insights through advanced
          analytics, strengthening cybersecurity, or exploring private AI integrations, PixelUI is
          ready to engineer your transformation.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
          <Button href="#contact" variant="dark" icon={ArrowRight}>
            Schedule Consultation
          </Button>
          <Button href="#contact" variant="secondaryDark" icon={MessageCircle}>
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
}
