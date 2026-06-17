import Link from "next/link";
import type { DashboardModule } from "@/lib/dashboard-modules";

interface ModuleCardProps {
  module: DashboardModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const Icon = module.icon;

  return (
    <Link
      href={module.href}
      className="card-glass group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-white">
        <Icon size={24} />
      </div>
      <h3 className="mb-2 font-display text-lg font-semibold text-navy">
        {module.title}
      </h3>
      <p className="flex-1 font-body text-sm leading-relaxed text-navy/70">
        {module.description}
      </p>
      <span className="mt-4 font-ui text-xs uppercase tracking-wider text-gold">
        Acceder →
      </span>
    </Link>
  );
}
