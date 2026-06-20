import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientesSubmodule } from "@/lib/dashboard-modules";
import type { DashboardModule } from "@/lib/dashboard-modules";
import { isAdmin } from "@/lib/roles";
import { ModulePageShell } from "@/components/dashboard/ModulePageShell";
import { FichaClientesPanel } from "@/components/dashboard/clientes/FichaClientesPanel";
import { PadronClientesPanel } from "@/components/dashboard/clientes/PadronClientesPanel";

interface ClientesPageProps {
  params: { submodulo: string };
}

export default async function ClientesSubmoduloPage({
  params,
}: ClientesPageProps) {
  const session = await auth();
  const submodule = getClientesSubmodule(params.submodulo);

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
      {params.submodulo === "ficha-de-clientes" && <FichaClientesPanel />}
      {params.submodulo === "padron-clientes" && <PadronClientesPanel />}
    </ModulePageShell>
  );
}
