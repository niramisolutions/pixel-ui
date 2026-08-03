import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="text-sm font-semibold tracking-tight text-accent-strong">404</p>
      <h1 className="text-section-title text-ink">This page could not be found</h1>
      <p className="max-w-md text-base text-muted">
        The page you are looking for may have been moved or no longer exists.
      </p>
      <Button href="/" icon={ArrowRight}>
        Back to Home
      </Button>
    </div>
  );
}
