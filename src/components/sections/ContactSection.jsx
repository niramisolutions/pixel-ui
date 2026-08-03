"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import {
  MailIcon,
  NdaIcon,
  PhoneIcon,
  RemoteFirstIcon,
} from "@/components/icons/ContactIcons";
import Button from "@/components/ui/Button";
import { Field, inputClasses } from "@/components/ui/FormField";
import SectionHeading from "@/components/ui/SectionHeading";
import { useMagnetic } from "@/hooks/useMagnetic";
import { CONTACT_INFO } from "@/constants/links";

const REQUIREMENTS = [
  "AI Automation",
  "Custom SaaS Development",
  "Data Analytics",
  "Managed IT Services",
  "Other",
];

// These six rules were the only thing zod was used for on the whole site, and the schema plus
// its resolver landed in the initial bundle — roughly 317KB of parsed JS before a visitor had
// scrolled anywhere near the form. react-hook-form validates this natively for nothing extra.
const trim = (value) => (typeof value === "string" ? value.trim() : value);

const EMAIL_PATTERN = /^[\w.%+-]+@[\w-]+(\.[\w-]+)*\.[A-Za-z]{2,}$/;

const RULES = {
  fullName: {
    setValueAs: trim,
    required: "Please enter your full name",
    minLength: { value: 2, message: "Please enter your full name" },
  },
  companyName: { setValueAs: trim },
  workEmail: {
    setValueAs: trim,
    required: "Enter a valid work email",
    pattern: { value: EMAIL_PATTERN, message: "Enter a valid work email" },
  },
  phone: { setValueAs: trim },
  requirement: {},
  projectSpecs: {
    setValueAs: trim,
    required: "Tell us a bit more about your project",
    minLength: { value: 10, message: "Tell us a bit more about your project" },
  },
};

function InfoCard({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface-strong px-4.25 py-6.25 shadow-[0px_2px_2px_0px_rgba(0,0,0,0.1)]">
      {/* the artwork carries its own rounded chip, so it is not wrapped in the bordered circle
          this card used to draw around a bare lucide glyph */}
      <Icon className="size-12 shrink-0" aria-hidden />
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold tracking-tight text-ink/80">
          {title}
        </p>
        <p className="text-xs text-muted-3">{subtitle}</p>
      </div>
    </div>
  );
}

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  // default strength, matching the header's desktop CTA
  const magneticRef = useMagnetic();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: "",
      companyName: "",
      workEmail: "",
      phone: "",
      requirement: "",
      projectSpecs: "",
    },
  });

  // Local only: this shows the confirmation panel but delivers nothing anywhere. Wire a form
  // backend or a server route in here when submissions actually need to reach an inbox.
  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSubmitted(true);
    reset();
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-b border-border bg-paper px-6 py-24 lg:px-16"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <SectionHeading
          id="contact-heading"
          title="Connect With Us"
          subtitle="Partner With PixelUI"
          description="Whether you are modernizing a government department, designing a complex SaaS product, or exploring custom AI pipelines, our executive engineering team is ready to assist."
          divider
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-border bg-surface px-6 py-10 shadow-[0px_7px_5px_0px_rgba(0,0,0,0.09),0px_40px_40px_0px_rgba(0,0,0,0.05)] sm:px-10">
            {submitted ? (
              <div
                role="status"
                className="flex flex-col items-center gap-3 py-16 text-center"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-accent/20">
                  <Sparkles className="size-6 text-ink" aria-hidden />
                </span>
                <h3 className="text-card-title text-ink">Request received</h3>
                <p className="max-w-sm text-sm text-muted">
                  Thank you for reaching out. Our team will follow up within one
                  business day.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-6"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    label="Full Name"
                    htmlFor="fullName"
                    required
                    error={errors.fullName?.message}
                  >
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter Full Name"
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={
                        errors.fullName ? "fullName-error" : undefined
                      }
                      className={inputClasses}
                      {...register("fullName", RULES.fullName)}
                    />
                  </Field>
                  <Field label="Company Name" htmlFor="companyName">
                    <input
                      id="companyName"
                      type="text"
                      autoComplete="organization"
                      placeholder="Enter Company Name"
                      className={inputClasses}
                      {...register("companyName", RULES.companyName)}
                    />
                  </Field>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    label="Work Email"
                    htmlFor="workEmail"
                    required
                    error={errors.workEmail?.message}
                  >
                    <input
                      id="workEmail"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter Work Email"
                      aria-invalid={Boolean(errors.workEmail)}
                      aria-describedby={
                        errors.workEmail ? "workEmail-error" : undefined
                      }
                      className={inputClasses}
                      {...register("workEmail", RULES.workEmail)}
                    />
                  </Field>
                  <Field label="Phone Number" htmlFor="phone">
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Enter Phone Number"
                      className={inputClasses}
                      {...register("phone", RULES.phone)}
                    />
                  </Field>
                </div>

                <Field
                  label="Primary Technical Requirement"
                  htmlFor="requirement"
                >
                  <div className="relative">
                    <select
                      id="requirement"
                      defaultValue=""
                      className={`${inputClasses} appearance-none pr-12`}
                      {...register("requirement", RULES.requirement)}
                    >
                      <option value="" disabled>
                        Select Your Requirement
                      </option>
                      {REQUIREMENTS.map((requirement) => (
                        <option key={requirement} value={requirement}>
                          {requirement}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute top-1/2 right-5 size-4.5 -translate-y-1/2 text-ink/40"
                      aria-hidden
                    />
                  </div>
                </Field>

                <Field
                  label="Project Specifications"
                  htmlFor="projectSpecs"
                  required
                  error={errors.projectSpecs?.message}
                >
                  <textarea
                    id="projectSpecs"
                    rows={5}
                    placeholder="Enter your Project Specifications here..."
                    aria-invalid={Boolean(errors.projectSpecs)}
                    aria-describedby={
                      errors.projectSpecs ? "projectSpecs-error" : undefined
                    }
                    className={`${inputClasses} resize-none`}
                    {...register("projectSpecs", RULES.projectSpecs)}
                  />
                </Field>

                {/* the shared Button rather than a hand-rolled one, so this stays in step with
                    the Schedule Consultation treatment instead of duplicating its styles.
                    The magnet goes on a wrapper because it translates the element it is given,
                    and the button's own hover scale would fight it on the same node. */}
                <div ref={magneticRef} className="self-start">
                  <Button
                    type="submit"
                    variant="dark"
                    icon={ArrowRight}
                    disabled={isSubmitting}
                    className="disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending…" : "Request Consultation"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* justify-center with symmetric padding: the panel stretches to the form's height,
              and the old pt-10/pb-18 was balancing content that is no longer here, so leaving
              it would settle the group ~1rem above true centre */}
          <div className="flex flex-col justify-center gap-6 rounded-2xl border border-border bg-surface px-4 py-10 shadow-[0px_7px_5px_0px_rgba(0,0,0,0.09),0px_40px_40px_0px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col gap-6">
              <InfoCard
                icon={MailIcon}
                title={CONTACT_INFO.email}
                subtitle="SLA Response: Within 4 business hours"
              />
              <InfoCard
                icon={PhoneIcon}
                title={CONTACT_INFO.phone}
                subtitle="Monday – Friday, 8:00 AM – 6:00 PM EST"
              />
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface-strong px-4.25 py-6.25 shadow-[0px_2px_2px_0px_rgba(0,0,0,0.1)]">
              <RemoteFirstIcon className="size-12 shrink-0" aria-hidden />
              <div className="flex flex-col gap-1">
                <p className="text-[15px] font-semibold tracking-tight text-ink/80">
                  Remote-First Deployment
                </p>
                <p className="text-xs text-muted-3">
                  Consultations available globally by appointment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface-strong px-4.25 py-6.25 shadow-[0px_2px_2px_0px_rgba(0,0,0,0.1)]">
              <NdaIcon className="size-12 shrink-0" aria-hidden />
              <div className="flex flex-col gap-1">
                <p className="text-[15px] font-semibold tracking-tight text-ink/80">
                  NDA &amp; IP Security Standard
                </p>
                <p className="text-xs text-muted-3">
                  All consultations and requests are strictly confidential.
                  Custom software architecture, source control, and metadata
                  parameters remain 100% owned by your organization under
                  complete IP isolation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
