import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTesoreriaSubmodule } from "@/lib/dashboard-modules";
import type { DashboardModule } from "@/lib/dashboard-modules";
import { isAdmin } from "@/lib/roles";
import { ModulePageShell } from "@/components/dashboard/ModulePageShell";
import { CuentasBancariasPanel } from "@/components/dashboard/tesoreria/CuentasBancariasPanel";
import { ExtractoBancoPanel } from "@/components/dashboard/tesoreria/ExtractoBancoPanel";

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
      {params.submodulo === "cuentas-bancarias" && <CuentasBancariasPanel />}
      {params.submodulo === "extracto-banco" && <ExtractoBancoPanel />}
    </ModulePageShell>
  );
}
