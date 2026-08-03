import Link from "next/link";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-gradient-accent text-ink shadow-[0px_2px_4px_0px_rgba(194,249,106,0.4)]",
  secondary: "border border-ink/40 bg-paper text-ink hover:bg-ink/5",
  secondaryDark: "border border-white/30 bg-transparent text-white hover:bg-white/10",
  // The "Schedule Consultation" treatment, used in the header, hero and closing CTA. Values
  // are literal rather than tokenised because the gradient stops and the #B1F66D border sit
  // slightly off the theme's accent/ink ramp and were specified exactly.
  dark: "border-[0.5px] border-[#B1F66D] bg-[linear-gradient(98.02deg,#081612_-1.15%,#07423C_114.96%)] text-accent shadow-[0px_2px_4px_0px_#0000001A] backdrop-blur-[100px]",
};

export default function Button({
  href,
  variant = "primary",
  icon: Icon,
  className,
  children,
  type = "button",
  ...props
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2.5 rounded-md px-4 py-4 text-xs font-medium whitespace-nowrap transition-transform duration-200 hover:scale-[1.02] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong",
    VARIANTS[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
        {Icon ? <Icon className="size-4.5" aria-hidden /> : null}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
      {Icon ? <Icon className="size-4.5" aria-hidden /> : null}
    </button>
  );
}
