import type { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Eye,
  LayoutDashboard,
  MessageCircle,
  Network,
  Settings,
  Sparkles,
  Star,
  Users,
  Video,
  Wand2,
} from "lucide-react";

export type DashboardModule = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  href: string;
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

export function getModuleBySlug(slug: string): DashboardModule | undefined {
  return dashboardModules.find((m) => m.slug === slug);
}
