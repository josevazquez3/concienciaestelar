"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowDownLeft,
  Calendar,
  ClipboardList,
  Contact,
  Eye,
  FileSpreadsheet,
  History,
  IdCard,
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
import type { ModuleIconName } from "@/lib/dashboard-modules";
import { cn } from "@/lib/utils";

const moduleIcons: Record<ModuleIconName, LucideIcon> = {
  users: Users,
  settings: Settings,
  contact: Contact,
  "clipboard-list": ClipboardList,
  "id-card": IdCard,
  wallet: Wallet,
  "file-spreadsheet": FileSpreadsheet,
  "arrow-down-left": ArrowDownLeft,
  history: History,
  calendar: Calendar,
  video: Video,
  star: Star,
  sparkles: Sparkles,
  network: Network,
  wand2: Wand2,
  eye: Eye,
  "message-circle": MessageCircle,
  "layout-dashboard": LayoutDashboard,
};

interface ModuleIconProps {
  name: ModuleIconName;
  size?: number;
  className?: string;
}

export function ModuleIcon({ name, size = 20, className }: ModuleIconProps) {
  const Icon = moduleIcons[name];
  if (!Icon) return null;
  return <Icon size={size} className={cn("shrink-0", className)} />;
}

export { LayoutDashboard };
