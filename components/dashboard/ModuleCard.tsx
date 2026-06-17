import Link from "next/link";
import type { DashboardModuleCard } from "@/lib/dashboard-modules";

interface ModuleCardProps {
  module: DashboardModuleCard;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const Icon = module.icon;

  return (
    <Link
      href={module.href}
      className="card-glass group flex h-full min-w-0 flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-white">
        <Icon size={24} />
      </div>
      {module.parentTitle && (
        <p className="mb-1 font-ui text-[10px] uppercase tracking-label text-navy/50">
          {module.parentTitle}
        </p>
      )}
      <h3 className="mb-2 break-words font-display text-base font-semibold text-navy sm:text-lg">
        {module.title}
      </h3>
      <p className="flex-1 break-words font-body text-sm leading-relaxed text-navy/70">
        {module.description}
      </p>
      <span className="mt-4 font-ui text-xs uppercase tracking-wider text-gold">
        Acceder →
      </span>
    </Link>
  );
}
