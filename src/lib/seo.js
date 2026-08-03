import { SITE_NAME, SITE_URL } from "@/constants/seo";
import { CONTACT_INFO } from "@/constants/links";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    email: CONTACT_INFO.email,
    telephone: CONTACT_INFO.phone,
  };
}
