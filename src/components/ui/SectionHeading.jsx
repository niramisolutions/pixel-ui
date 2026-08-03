import { cn } from "@/lib/utils";

export default function SectionHeading({
  id,
  as: Heading = "h2",
  title,
  subtitle,
  description,
  tone = "light",
  align = "center",
  divider = false,
  className,
}) {
  const isDark = tone === "dark";
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6 pt-3",
        isCentered ? "items-center text-center" : "items-start text-left",
        // the design rules off the header only where it butts up against a form
        divider && "border-b pb-3",
        divider && (isDark ? "border-white/10" : "border-border"),
        className,
      )}
    >
      <Heading
        id={id}
        className={cn(
          "text-section-title text-balance",
          isDark ? "text-paper" : "text-ink",
        )}
      >
        {title}
      </Heading>

      {subtitle || description ? (
        <div
          className={cn(
            "flex flex-col gap-1",
            isCentered ? "items-center" : "items-start",
          )}
        >
          {subtitle ? (
            <p
              className={cn(
                "text-section-subtitle",
                isDark ? "text-paper" : "text-ink/90",
              )}
            >
              {subtitle}
            </p>
          ) : null}
          {description ? (
            <p
              className={cn(
                "text-lead max-w-5xl",
                isDark ? "text-white/60" : "text-ink/50",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
