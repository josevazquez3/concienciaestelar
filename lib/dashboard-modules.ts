export type DashboardRole = "ADMIN" | "CLIENTE";
export type ModuleIconName =
  | "users"
  | "settings"
  | "contact"
  | "clipboard-list"
  | "id-card"
  | "wallet"
  | "file-spreadsheet"
  | "arrow-down-left"
  | "history"
  | "calendar"
  | "video"
  | "star"
  | "sparkles"
  | "network"
  | "wand2"
  | "eye"
  | "message-circle"
  | "layout-dashboard";

export type DashboardSubmodule = {
  slug: string;
  title: string;
  description: string;
  icon: ModuleIconName;
  href: string;
};

export type DashboardModule = {
  slug: string;
  title: string;
  description: string;
  icon: ModuleIconName;
  adminOnly?: boolean;
  href: string;
  children?: DashboardSubmodule[];
};

export type DashboardModuleCard = {
  slug: string;
  title: string;
  description: string;
  icon: ModuleIconName;
  href: string;
  parentTitle?: string;
};

export const dashboardModules: DashboardModule[] = [
  {
    slug: "usuarios",
    title: "Gestión Usuarios",
    description: "Administrá cuentas, roles y permisos de la plataforma.",
    icon: "users",
    adminOnly: true,
    href: "/dashboard/usuarios",
  },
  {
    slug: "configuracion",
    title: "Configuración",
    description: "Ajustes generales de la plataforma y preferencias.",
    icon: "settings",
    adminOnly: true,
    href: "/dashboard/configuracion",
  },
  {
    slug: "clientes",
    title: "Clientes",
    description: "Gestión de fichas y padrón de clientes.",
    icon: "contact",
    adminOnly: true,
    href: "/dashboard/clientes/padron-clientes",
    children: [
      {
        slug: "padron-clientes",
        title: "Padrón Clientes",
        description: "Listado general y padrón de clientes.",
        icon: "clipboard-list",
        href: "/dashboard/clientes/padron-clientes",
      },
      {
        slug: "ficha-de-clientes",
        title: "Ficha de clientes",
        description: "Ficha detallada y datos de cada cliente.",
        icon: "id-card",
        href: "/dashboard/clientes/ficha-de-clientes",
      },
    ],
  },
  {
    slug: "tesoreria",
    title: "Tesorería",
    description: "Gestión financiera y extractos bancarios.",
    icon: "wallet",
    adminOnly: true,
    href: "/dashboard/tesoreria/extracto-banco",
    children: [
      {
        slug: "extracto-banco",
        title: "Extracto Banco",
        description: "Gestión e importación de movimientos bancarios.",
        icon: "file-spreadsheet",
        href: "/dashboard/tesoreria/extracto-banco",
      },
      {
        slug: "transferencias-recibidas",
        title: "Transferencias recibidas",
        description:
          "Transferencias recibidas con importe positivo del extracto bancario.",
        icon: "arrow-down-left",
        href: "/dashboard/tesoreria/transferencias-recibidas",
      },
      {
        slug: "historial-pago",
        title: "Historial de pago",
        description: "Historial de transferencias recibidas por cliente.",
        icon: "history",
        href: "/dashboard/tesoreria/historial-pago",
      },
    ],
  },
  {
    slug: "encuentros",
    title: "Encuentros",
    description: "Encuentros en vivo, Zoom y calendario de sesiones.",
    icon: "calendar",
    href: "/dashboard/encuentros",
  },
  {
    slug: "videos",
    title: "Videos",
    description: "Biblioteca de videos y grabaciones de encuentros.",
    icon: "video",
    href: "/dashboard/videos",
  },
  {
    slug: "acompanamiento-semanal",
    title: "Acompañamiento Astrológico Semanal",
    description: "Lecturas semanales del cielo aplicadas a tu proceso.",
    icon: "star",
    href: "/dashboard/acompanamiento-semanal",
  },
  {
    slug: "astrologia-ascensional",
    title: "Astrología Ascensional Aplicada",
    description: "Mapas de activación y frecuencias superiores.",
    icon: "sparkles",
    href: "/dashboard/astrologia-ascensional",
  },
  {
    slug: "tejido-red",
    title: "Tejido de la Red",
    description: "Comunidad activa y conexiones de la red.",
    icon: "network",
    href: "/dashboard/tejido-red",
  },
  {
    slug: "canalizacion-orden",
    title: "Canalización y Orden",
    description: "Registros álmicos, numerología y misión.",
    icon: "wand2",
    href: "/dashboard/canalizacion-orden",
  },
  {
    slug: "observacion-consciente",
    title: "Observación Consciente",
    description: "Prácticas de presencia y discernimiento.",
    icon: "eye",
    href: "/dashboard/observacion-consciente",
  },
  {
    slug: "whatsapp",
    title: "Espacio WhatsApp Continuo",
    description: "Canal de comunicación y sostén del vínculo.",
    icon: "message-circle",
    href: "/dashboard/whatsapp",
  },
];

export function getModulesForRole(role: DashboardRole): DashboardModule[] {
  if (role === "ADMIN") {
    return dashboardModules;
  }
  return dashboardModules.filter((m) => !m.adminOnly);
}

export function getModuleCardsForRole(role: DashboardRole): DashboardModuleCard[] {
  const cards: DashboardModuleCard[] = [];

  for (const mod of getModulesForRole(role)) {
    if (mod.children?.length) {
      for (const child of mod.children) {
        cards.push({
          slug: `${mod.slug}-${child.slug}`,
          title: child.title,
          description: child.description,
          icon: child.icon,
          href: child.href,
          parentTitle: mod.title,
        });
      }
      continue;
    }

    cards.push({
      slug: mod.slug,
      title: mod.title,
      description: mod.description,
      icon: mod.icon,
      href: mod.href,
    });
  }

  return cards;
}

export function getModuleBySlug(slug: string): DashboardModule | undefined {
  return dashboardModules.find((m) => m.slug === slug);
}

export function getModuleSubmodule(
  parentSlug: string,
  submodulo: string
): (DashboardSubmodule & { parent: DashboardModule }) | undefined {
  const parent = dashboardModules.find((m) => m.slug === parentSlug);
  const child = parent?.children?.find((c) => c.slug === submodulo);
  if (!parent || !child) return undefined;
  return { ...child, parent };
}

export function getTesoreriaSubmodule(
  submodulo: string
): (DashboardSubmodule & { parent: DashboardModule }) | undefined {
  return getModuleSubmodule("tesoreria", submodulo);
}

export function getClientesSubmodule(
  submodulo: string
): (DashboardSubmodule & { parent: DashboardModule }) | undefined {
  return getModuleSubmodule("clientes", submodulo);
}
