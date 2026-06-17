"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  getModulesForRole,
  type DashboardModule,
  type DashboardSubmodule,
} from "@/lib/dashboard-modules";
import { Logo } from "@/components/landing/Logo";

interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const modules = getModulesForRole(user.role);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-gold/30 bg-warm-white p-2 text-navy lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-navy/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-gold/20 bg-navy-dark text-white transition-transform lg:static lg:w-72 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <Link href="/dashboard" onClick={() => setOpen(false)}>
            <Logo size="sm" light />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-white/70 lg:hidden"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-4">
          <p className="truncate font-body text-sm font-medium text-white">
            {user.name ?? "Usuario"}
          </p>
          <p className="truncate font-body text-xs text-white/50">{user.email}</p>
          <span className="mt-2 inline-block rounded-full bg-gold/20 px-2 py-0.5 font-ui text-[10px] uppercase tracking-wider text-gold-light">
            {user.role}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className={cn(
              "mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 font-ui text-sm transition-colors",
              pathname === "/dashboard"
                ? "bg-gold/20 text-gold-light"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <LayoutDashboard size={18} />
            Inicio
          </Link>

          <p className="mb-2 mt-4 px-3 font-ui text-[10px] uppercase tracking-label text-white/40">
            Módulos
          </p>

          <ul className="space-y-1">
            {modules.map((mod) =>
              mod.children?.length ? (
                <SidebarModuleGroup
                  key={mod.slug}
                  module={mod}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
              ) : (
                <SidebarLink
                  key={mod.slug}
                  module={mod}
                  active={pathname === mod.href}
                  onNavigate={() => setOpen(false)}
                />
              )
            )}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="mb-2 block rounded-xl px-3 py-2 font-ui text-sm text-white/60 transition-colors hover:text-white"
          >
            ← Volver a la landing
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-ui text-sm text-white/70 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarModuleGroup({
  module,
  pathname,
  onNavigate,
}: {
  module: DashboardModule;
  pathname: string;
  onNavigate: () => void;
}) {
  const groupActive = pathname.startsWith(`/dashboard/${module.slug}`);
  const [expanded, setExpanded] = useState(groupActive);
  const Icon = module.icon;

  useEffect(() => {
    if (groupActive) {
      setExpanded(true);
    }
  }, [groupActive]);

  return (
    <li>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-ui text-sm transition-colors",
          groupActive
            ? "bg-gold/20 text-gold-light"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        )}
        aria-expanded={expanded}
      >
        <Icon size={18} className="shrink-0" />
        <span className="min-w-0 flex-1 text-left leading-snug">{module.title}</span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 transition-transform",
            expanded ? "rotate-180" : ""
          )}
        />
      </button>

      {expanded && (
        <ul className="mt-1 space-y-0.5 border-l border-white/10 pl-3 ml-5">
          {module.children!.map((child) => (
            <SidebarChildLink
              key={child.slug}
              child={child}
              active={pathname === child.href}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function SidebarChildLink({
  child,
  active,
  onNavigate,
}: {
  child: DashboardSubmodule;
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = child.icon;

  return (
    <li>
      <Link
        href={child.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 font-ui text-xs transition-colors",
          active
            ? "bg-gold/15 text-gold-light"
            : "text-white/60 hover:bg-white/5 hover:text-white"
        )}
      >
        <Icon size={16} className="shrink-0" />
        <span className="min-w-0 leading-snug">{child.title}</span>
      </Link>
    </li>
  );
}

function SidebarLink({
  module,
  active,
  onNavigate,
}: {
  module: DashboardModule;
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = module.icon;

  return (
    <li>
      <Link
        href={module.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 font-ui text-sm transition-colors",
          active
            ? "bg-gold/20 text-gold-light"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        )}
      >
        <Icon size={18} className="shrink-0" />
        <span className="min-w-0 leading-snug">{module.title}</span>
      </Link>
    </li>
  );
}
