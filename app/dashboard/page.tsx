import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { getModuleCardsForRole } from "@/lib/dashboard-modules";

export default async function DashboardHomePage() {
  const session = await auth();
  const modules = getModuleCardsForRole(session!.user.role);

  return (
    <div className="min-w-0">
      <div className="mb-8 sm:mb-10">
        <p className="section-label mb-2">Panel de membresía</p>
        <h1 className="break-words font-display text-2xl font-semibold text-navy sm:text-3xl">
          Bienvenido/a, {session?.user.name ?? "viajero estelar"}
        </h1>
        <p className="mt-2 font-body italic text-navy/70">
          Elegí un módulo para acceder a tu contenido y acompañamiento.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((mod) => (
          <ModuleCard key={mod.slug} module={mod} />
        ))}
      </div>
    </div>
  );
}
