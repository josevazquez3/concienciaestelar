import type { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownLeft,
  Calendar,
  Eye,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  MessageCircle,
  Network,
  Settings,
  Sparkles,
  Star,
  Users,
  Video,
  Wallet,
  Wand2,
} from "lucide-react";

export type DashboardSubmodule = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
};

export type DashboardModule = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  href: string;
  children?: DashboardSubmodule[];
};

export type DashboardModuleCard = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  parentTitle?: string;
};

export const dashboardModules: DashboardModule[] = [
  {
    slug: "usuarios",
    title: "Gestión Usuarios",
    description: "Administrá cuentas, roles y permisos de la plataforma.",
    icon: Users,
    adminOnly: true,
    href: "/dashboard/usuarios",
  },
  {
    slug: "configuracion",
    title: "Configuración",
    description: "Ajustes generales de la plataforma y preferencias.",
    icon: Settings,
    adminOnly: true,
    href: "/dashboard/configuracion",
  },
  {
    slug: "tesoreria",
    title: "Tesorería",
    description: "Gestión financiera y extractos bancarios.",
    icon: Wallet,
    adminOnly: true,
    href: "/dashboard/tesoreria/extracto-banco",
    children: [
      {
        slug: "extracto-banco",
        title: "Extracto Banco",
        description: "Gestión e importación de movimientos bancarios.",
        icon: FileSpreadsheet,
        href: "/dashboard/tesoreria/extracto-banco",
      },
      {
        slug: "transferencias-recibidas",
        title: "Transferencias recibidas",
        description: "Transferencias recibidas con importe positivo del extracto bancario.",
        icon: ArrowDownLeft,
        href: "/dashboard/tesoreria/transferencias-recibidas",
      },
      {
        slug: "historial-pago",
        title: "Historial de pago",
        description: "Historial de transferencias recibidas por cliente.",
        icon: History,
        href: "/dashboard/tesoreria/historial-pago",
      },
    ],
  },
  {
    slug: "encuentros",
    title: "Encuentros",
    description: "Encuentros en vivo, Zoom y calendario de sesiones.",
    icon: Calendar,
    href: "/dashboard/encuentros",
  },
  {
    slug: "videos",
    title: "Videos",
    description: "Biblioteca de videos y grabaciones de encuentros.",
    icon: Video,
    href: "/dashboard/videos",
  },
  {
    slug: "acompanamiento-semanal",
    title: "Acompañamiento Astrológico Semanal",
    description: "Lecturas semanales del cielo aplicadas a tu proceso.",
    icon: Star,
    href: "/dashboard/acompanamiento-semanal",
  },
  {
    slug: "astrologia-ascensional",
    title: "Astrología Ascensional Aplicada",
    description: "Mapas de activación y frecuencias superiores.",
    icon: Sparkles,
    href: "/dashboard/astrologia-ascensional",
  },
  {
    slug: "tejido-red",
    title: "Tejido de la Red",
    description: "Comunidad activa y conexiones de la red.",
    icon: Network,
    href: "/dashboard/tejido-red",
  },
  {
    slug: "canalizacion-orden",
    title: "Canalización y Orden",
    description: "Registros álmicos, numerología y misión.",
    icon: Wand2,
    href: "/dashboard/canalizacion-orden",
  },
  {
    slug: "observacion-consciente",
    title: "Observación Consciente",
    description: "Prácticas de presencia y discernimiento.",
    icon: Eye,
    href: "/dashboard/observacion-consciente",
  },
  {
    slug: "whatsapp",
    title: "Espacio WhatsApp Continuo",
    description: "Canal de comunicación y sostén del vínculo.",
    icon: MessageCircle,
    href: "/dashboard/whatsapp",
  },
];

export function getModulesForRole(role: Role): DashboardModule[] {
  if (role === "ADMIN") {
    return dashboardModules;
  }
  return dashboardModules.filter((m) => !m.adminOnly);
}

export function getModuleCardsForRole(role: Role): DashboardModuleCard[] {
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

export function getTesoreriaSubmodule(
  submodulo: string
): (DashboardSubmodule & { parent: DashboardModule }) | undefined {
  const parent = dashboardModules.find((m) => m.slug === "tesoreria");
  const child = parent?.children?.find((c) => c.slug === submodulo);
  if (!parent || !child) return undefined;
  return { ...child, parent };
}

export { LayoutDashboard };
