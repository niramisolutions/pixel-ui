import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";

export default function IconBulletList({ items, className, itemClassName }) {
  return (
    <ul className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => (
        <li key={item} className={cn("flex items-center gap-1", itemClassName)}>
          <Dot className="size-5 shrink-0" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
