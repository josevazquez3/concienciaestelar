import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getModuleBySlug } from "@/lib/dashboard-modules";
import { isAdmin } from "@/lib/roles";
import { ModulePageShell } from "@/components/dashboard/ModulePageShell";
import { UsuariosPanel } from "@/components/admin/UsuariosPanel";
import { ConfiguracionPanel } from "@/components/admin/ConfiguracionPanel";
import { WhatsappModuleContent } from "@/components/dashboard/WhatsappModuleContent";
import { VideosPanel } from "@/components/dashboard/VideosPanel";

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

  if (params.modulo === "whatsapp") {
    return (
      <ModulePageShell module={dashboardModule}>
        <WhatsappModuleContent />
      </ModulePageShell>
    );
  }

  if (params.modulo === "configuracion") {
    return (
      <ModulePageShell module={dashboardModule}>
        <ConfiguracionPanel />
      </ModulePageShell>
    );
  }

  if (params.modulo === "videos") {
    return (
      <ModulePageShell module={dashboardModule}>
        <VideosPanel isAdmin={isAdmin(session)} />
      </ModulePageShell>
    );
  }

  return <ModulePageShell module={dashboardModule} />;
}
