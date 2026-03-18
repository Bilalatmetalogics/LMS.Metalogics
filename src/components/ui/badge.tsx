import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger" | "indigo";

const variants: Record<Variant, string> = {
  default: "bg-zinc-100 text-zinc-600",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  indigo: "bg-indigo-50 text-indigo-700",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
