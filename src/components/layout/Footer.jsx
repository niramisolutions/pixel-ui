import Link from "next/link";
import { MailIcon, PhoneIcon } from "@/components/icons/ContactIcons";
import Logo from "@/components/ui/Logo";
import { CONTACT_INFO, FOOTER_LINK_GROUPS } from "@/constants/links";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-dark px-6 py-20 lg:px-16">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-white p-6 shadow-[0px_7px_5px_0px_rgba(0,0,0,0.09),0px_40px_40px_0px_rgba(0,0,0,0.05)] sm:p-10">
        <div className="flex flex-col justify-between gap-10 border-b border-border pb-10 lg:flex-row">
          <div className="flex flex-col gap-6 lg:basis-1/3">
            {/* self-start stops the column's default align-items:stretch from widening the mark
                to the full column and squashing its aspect ratio. */}
            <Logo variant="stacked" className="h-24 self-start" />
            {/* likewise keeps the mailto/tel hit areas on the text rather than spanning the
                whole column, which is now much wider */}
            <div className="flex flex-col gap-3 self-start">
              {/* the contact-panel artwork, at size-8 rather than the 48px used there: these
                  are inline links beside 14px text, not cards, so the chip would swamp them */}
              <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-3 text-sm text-ink/80">
                <MailIcon className="size-8 shrink-0" aria-hidden />
                {CONTACT_INFO.email}
              </a>
              <a href={`tel:${CONTACT_INFO.phone}`} className="flex items-center gap-3 text-sm text-ink/80">
                <PhoneIcon className="size-8 shrink-0" aria-hidden />
                {CONTACT_INFO.phone}
              </a>
            </div>
          </div>

          {/* Track count matches FOOTER_LINK_GROUPS — a third track would sit empty and stop
              the last column sitting flush right under lg:justify-items-end. */}
          <div className="grid flex-1 grid-cols-2 gap-8 lg:justify-items-end">
            {FOOTER_LINK_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-5">
                <p className="text-base font-semibold tracking-tight text-ink">{group.title}</p>
                <ul className="flex flex-col gap-4">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-xs text-ink/60 hover:text-ink">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* justify-center rather than justify-between: with the legal links gone there is a
            single child, and space-between would just pin it to the left edge on sm and up. */}
        <div className="flex flex-col items-center justify-center gap-3 pt-10 text-[15px] tracking-tight text-ink sm:flex-row">
          <p className="font-semibold">© {year} PixelUI. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
