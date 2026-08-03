import SectionHeading from "@/components/ui/SectionHeading";
import ServicesShowcase from "@/components/sections/ServicesShowcase";

const SERVICES = [
  {
    title: "AI Automation",
    description:
      "Deploying LLMs and machine learning pipelines to streamline operational workflows and decision-making.",
    image: "/images/ai-automation-art.webp",
    model: "/models/ai-automation.glb",
    modelConfig: {
      position: [0.4, -0.13, 0.5], // [x, y, z]
      tiltDeg: [40, 170, -10], // [pitch, yaw, roll] in degrees
      scale: 1.1,
      swaySpeed: 0.6,
      swayAmplitudeDeg: 20,
    },
    items: [
      "AI Workflow Automation",
      "Custom AI Agents",
      "Process Automation",
      "Private AI Integration",
      "Document Processing",
      "Knowledge Bases",
    ],
  },
  {
    title: "Data Analytics",
    description:
      "Transform raw business data into actionable insights through dashboards, reporting, predictive analytics, and business intelligence.",
    image: "/images/data-analytics-art.webp",
    model: "/models/data-analytics.glb",
    modelConfig: {
      position: [0.12, -0.06, 1.5], // [x, y, z]
      tiltDeg: [10, -1.5, 0.1], // [pitch, yaw, roll] in degrees
      // scale is tied to the glb's own extents (0.268 world units here) — re-derive it
      // whenever the model is swapped, or it renders at the wrong size
      scale: 1,
      swaySpeed: 0.6,
      swayAmplitudeDeg: 20,
    },
    items: [
      "Business Intelligence",
      "KPI Dashboards",
      "Reporting Automation",
      "Data Warehousing",
      "ETL Pipelines",
      "Predictive Analytics",
    ],
  },
  {
    title: "Managed IT Services",
    description:
      "Provide reliable IT operations, proactive monitoring, cloud management, cybersecurity, and technical support to keep your business running efficiently.",
    image: "/images/managed-it-art.webp",
    model: "/models/managed-it.glb",
    modelConfig: {
      position: [0.35, -0.15, 0.7], // [x, y, z]
      tiltDeg: [16, -1, -1], // [pitch, yaw, roll] in degrees
      scale: 0.0588, // glb extent is 10.10 world units
      swaySpeed: 0.6,
      swayAmplitudeDeg: 20,
    },
    items: [
      "Infrastructure Management",
      "Network Monitoring",
      "Cloud Administration",
      "Help Desk Support",
      "Backup & Disaster Recovery",
      "Security Management",
    ],
  },
  {
    title: "Custom SaaS Development",
    description:
      "Design and engineer secure cloud-native software tailored to your business operations, from internal tools to enterprise SaaS platforms.",
    image: "/images/custom-saas-art.webp",
    model: "/models/custom-saas.glb",
    modelConfig: {
      position: [0.3, -0.18, 0.7], // [x, y, z]
      tiltDeg: [-0.9, -40, 0], // [pitch, yaw, roll] in degrees
      scale: 0.118, // glb extent is 4.86 world units
      swaySpeed: 0.6,
      swayAmplitudeDeg: 20,
    },
    items: [
      "SaaS Platforms",
      "Internal Business Systems",
      "API Development",
      "Cloud Applications",
      "Database Architecture",
      "User Experience Design",
    ],
  },
];

export default function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="border-b border-border bg-surface"
    >
      {/* Horizontal padding now lives inside the showcase: the card track has to be able to
          run the full width of the viewport while the heading stays in the 6xl column. */}
      <ServicesShowcase services={SERVICES}>
        <SectionHeading
          id="services-heading"
          title="Enterprise Technology Services"
          description="Delivering end-to-end digital transformation solutions that help organizations automate workflows, build scalable software, unlock data-driven insights, and maintain secure IT operations."
        />
      </ServicesShowcase>
    </section>
  );
}
