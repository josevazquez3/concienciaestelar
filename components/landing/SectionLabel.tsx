import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: string;
  className?: string;
  light?: boolean;
}

export function SectionLabel({ children, className, light }: SectionLabelProps) {
  return (
    <p
      className={cn(
        "section-label mb-3",
        light && "text-white/70",
        className
      )}
    >
      {children}
    </p>
  );
}

export function GoldSeparator({ className }: { className?: string }) {
  return <div className={cn("gold-separator my-6", className)} />;
}

export function StarIcon({ className }: { className?: string }) {
  return <span className={cn("text-gold", className)}>✦</span>;
}
