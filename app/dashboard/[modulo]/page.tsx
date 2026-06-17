import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getModuleBySlug } from "@/lib/dashboard-modules";
import { isAdmin } from "@/lib/roles";
import { ModulePageShell } from "@/components/dashboard/ModulePageShell";
import { UsuariosPanel } from "@/components/admin/UsuariosPanel";

interface ModuloPageProps {
  params: { modulo: string };
}

export default async function ModuloPage({ params }: ModuloPageProps) {
  const session = await auth();
  const dashboardModule = getModuleBySlug(params.modulo);

  if (!dashboardModule) {
    notFound();
  }

  if (dashboardModule.adminOnly && !isAdmin(session)) {
    redirect("/dashboard");
  }

  if (params.modulo === "usuarios") {
    return (
      <ModulePageShell module={dashboardModule}>
        <UsuariosPanel />
      </ModulePageShell>
    );
  }

  return <ModulePageShell module={dashboardModule} />;
}
