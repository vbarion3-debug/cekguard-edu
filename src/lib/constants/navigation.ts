import {
  Accessibility,
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  GraduationCap,
  LayoutDashboard,
  Library,
  ListChecks,
  ScanSearch,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Paths that should also mark this item active. */
  match?: string[];
  roles?: Role[];
  shortcut?: string;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "1" },
  {
    href: "/scan",
    label: "Cek Risiko",
    icon: ScanSearch,
    match: ["/cekjudol", "/ceklink", "/cekdeepfake"],
    shortcut: "2",
  },
  { href: "/learning", label: "Belajar", icon: BookOpen, shortcut: "3" },
  { href: "/quiz", label: "Quiz", icon: ListChecks, shortcut: "4" },
  { href: "/progress", label: "Progress", icon: BarChart3, shortcut: "5" },
  { href: "/tutor", label: "AI Tutor", icon: Bot, shortcut: "6" },
  { href: "/profile", label: "Profil", icon: UserRound, shortcut: "7" },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/knowledge", label: "Knowledge Base", icon: Library },
  { href: "/accessibility", label: "Aksesibilitas", icon: Accessibility, shortcut: "8" },
];

export const ROLE_NAV: NavItem[] = [
  { href: "/teacher", label: "Dashboard Guru", icon: GraduationCap, roles: ["TEACHER", "ADMIN"] },
  { href: "/institution", label: "Institusi", icon: Building2, roles: ["ADMIN"] },
];

export const MOBILE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/scan", label: "Scan", icon: ScanSearch, match: ["/cekjudol", "/ceklink", "/cekdeepfake"] },
  { href: "/learning", label: "Learn", icon: BookOpen, match: ["/quiz"] },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: UserRound, match: ["/accessibility"] },
];

export const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Siswa",
  TEACHER: "Guru",
  ADMIN: "Admin Institusi",
};

export function isActivePath(pathname: string, item: NavItem): boolean {
  const paths = [item.href, ...(item.match ?? [])];
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
