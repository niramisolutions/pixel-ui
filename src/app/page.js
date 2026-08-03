import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import CTASection from "@/components/sections/CTASection";

const ContactSection = dynamic(() => import("@/components/sections/ContactSection"));

export default function Page() {
  return (
    <>
      <Hero />
      <Services />
      <Process />
      <WhyChooseUs />
      <CTASection />
      <ContactSection />
    </>
  );
}
