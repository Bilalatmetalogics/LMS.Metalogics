import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-zinc-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-600">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
