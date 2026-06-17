import type { DashboardModule } from "@/lib/dashboard-modules";

interface ModulePageShellProps {
  module: DashboardModule;
  children?: React.ReactNode;
}

export function ModulePageShell({ module, children }: ModulePageShellProps) {
  const Icon = module.icon;

  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold">
          <Icon size={28} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy md:text-3xl">
            {module.title}
          </h1>
          <p className="mt-1 font-body text-navy/70">{module.description}</p>
        </div>
      </div>

      {children ?? (
        <div className="card-glass p-8 text-center">
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
