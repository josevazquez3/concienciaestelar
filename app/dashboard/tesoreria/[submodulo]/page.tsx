import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTesoreriaSubmodule } from "@/lib/dashboard-modules";
import type { DashboardModule } from "@/lib/dashboard-modules";
import { isAdmin } from "@/lib/roles";
import { ModulePageShell } from "@/components/dashboard/ModulePageShell";
import { ExtractoBancoPanel } from "@/components/dashboard/tesoreria/ExtractoBancoPanel";
import { TransferenciasRecibidasPanel } from "@/components/dashboard/tesoreria/TransferenciasRecibidasPanel";
import { HistorialPagoPanel } from "@/components/dashboard/tesoreria/HistorialPagoPanel";

interface TesoreriaPageProps {
  params: { submodulo: string };
}

export default async function TesoreriaSubmoduloPage({
  params,
}: TesoreriaPageProps) {
  const session = await auth();
  const submodule = getTesoreriaSubmodule(params.submodulo);

  if (!submodule) {
    notFound();
  }

  if (submodule.parent.adminOnly && !isAdmin(session)) {
    redirect("/dashboard");
  }

  const moduleForShell: DashboardModule = {
    slug: submodule.slug,
    title: submodule.title,
    description: submodule.description,
    icon: submodule.icon,
    href: submodule.href,
  };

  return (
    <ModulePageShell module={moduleForShell}>
      {params.submodulo === "extracto-banco" && <ExtractoBancoPanel />}
      {params.submodulo === "transferencias-recibidas" && (
        <TransferenciasRecibidasPanel />
      )}
      {params.submodulo === "historial-pago" && <HistorialPagoPanel />}
    </ModulePageShell>
  );
}
