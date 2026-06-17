import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  hideTextOnMobile?: boolean;
  className?: string;
  light?: boolean;
}

const sizes = {
  sm: { icon: "h-8 w-8", text: "text-lg" },
  md: { icon: "h-10 w-10", text: "text-xl" },
  lg: { icon: "h-16 w-16", text: "text-3xl md:text-4xl" },
};

export function Logo({
  size = "md",
  showText = true,
  hideTextOnMobile = false,
  className,
  light,
}: LogoProps) {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gradient-to-br from-gold/20 to-gold/5",
          s.icon
        )}
      >
        <span className="text-gold text-lg leading-none">✦</span>
      </div>
      {showText && (
        <span
          className={cn(
            "font-display font-semibold tracking-wide",
            s.text,
            light ? "text-white" : "text-navy",
            hideTextOnMobile && "hidden sm:inline"
          )}
        >
          Consciencia Estelar
        </span>
      )}
    </div>
  );
}
