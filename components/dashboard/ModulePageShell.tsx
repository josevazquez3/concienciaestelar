import type { DashboardModule } from "@/lib/dashboard-modules";
import { ModuleIcon } from "@/components/dashboard/ModuleIcon";

interface ModulePageShellProps {
  module: DashboardModule;
  children?: React.ReactNode;
}

export function ModulePageShell({ module, children }: ModulePageShellProps) {
  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-wrap items-start gap-4 sm:mb-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold sm:h-14 sm:w-14">
          <ModuleIcon name={module.icon} size={24} className="sm:hidden" />
          <ModuleIcon name={module.icon} size={28} className="hidden sm:block" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="break-words font-display text-xl font-semibold text-navy sm:text-2xl md:text-3xl">
            {module.title}
          </h1>
          <p className="mt-1 break-words font-body text-sm text-navy/70 sm:text-base">
            {module.description}
          </p>
        </div>
      </div>

      {children ?? (
        <div className="card-glass p-6 text-center sm:p-8">
          <p className="font-body italic text-navy/60">
            Este módulo está listo para cargar contenido, archivos y recursos.
          </p>
          <p className="mt-2 font-ui text-xs uppercase tracking-label text-gold">
            Próximamente · Vercel Blob
          </p>
        </div>
      )}
    </div>
  );
}
