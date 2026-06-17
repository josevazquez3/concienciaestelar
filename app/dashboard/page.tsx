import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { getModulesForRole } from "@/lib/dashboard-modules";

export default async function DashboardHomePage() {
  const session = await auth();
  const modules = getModulesForRole(session!.user.role);

  return (
    <div>
      <div className="mb-10">
        <p className="section-label mb-2">Panel de membresía</p>
        <h1 className="font-display text-3xl font-semibold text-navy">
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
