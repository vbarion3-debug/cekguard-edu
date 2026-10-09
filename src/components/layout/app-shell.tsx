"use client";

import { Accessibility, Keyboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { PageSkeleton } from "@/components/ui/feedback";
import { Modal } from "@/components/ui/modal";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  MAIN_NAV,
  MOBILE_NAV,
  ROLE_LABEL,
  ROLE_NAV,
  SECONDARY_NAV,
  isActivePath,
  type NavItem,
} from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/store/app-store";

function NavLink({ item, pathname, showShortcut }: { item: NavItem; pathname: string; showShortcut: boolean }) {
  const active = isActivePath(pathname, item);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
        active
          ? "bg-primary-soft text-primary [[data-contrast=high]_&]:outline [[data-contrast=high]_&]:outline-2"
          : "text-fg-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-fg-muted group-hover:text-fg")} aria-hidden />
      <span className="flex-1">{item.label}</span>
      {active && <span className="sr-only">(halaman saat ini)</span>}
      {showShortcut && item.shortcut && (
        <kbd className="rounded border border-border bg-surface px-1.5 text-[10px] font-semibold text-fg-muted">
          Alt+{item.shortcut}
        </kbd>
      )}
    </Link>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  const session = useAppStore((s) => s.session);
  const logout = useAppStore((s) => s.logout);
  const keyboard = useAppStore((s) => s.accessibility.keyboard);
  const router = useRouter();
  const roleNav = ROLE_NAV.filter((n) => session && n.roles?.includes(session.role));

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 flex-col border-r border-border bg-surface lg:flex">
      <div className="px-5 pb-4 pt-5">
        <Link href="/dashboard" aria-label="CekGuard Edu — ke Dashboard" className="inline-block rounded-xl">
          <Logo />
        </Link>
      </div>
      <nav aria-label="Navigasi utama" className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-1">
          {MAIN_NAV.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} showShortcut={keyboard} />
            </li>
          ))}
        </ul>
        {roleNav.length > 0 && (
          <>
            <p className="mb-1 mt-6 px-3 text-[11px] font-bold uppercase tracking-wider text-fg-muted">Pengelolaan</p>
            <ul className="space-y-1">
              {roleNav.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} pathname={pathname} showShortcut={keyboard} />
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mb-1 mt-6 px-3 text-[11px] font-bold uppercase tracking-wider text-fg-muted">Lainnya</p>
        <ul className="space-y-1">
          {SECONDARY_NAV.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} showShortcut={keyboard} />
            </li>
          ))}
        </ul>
      </nav>
      {session && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft font-bold text-primary" aria-hidden>
              {session.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-fg">{session.name}</p>
              <p className="text-xs text-fg-muted">{ROLE_LABEL[session.role]}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="grid h-9 w-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg"
              aria-label="Keluar"
              title="Keluar"
            >
              <LogOut className="h-4.5 w-4.5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function MobileTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur lg:hidden">
      <Link href="/dashboard" aria-label="CekGuard Edu — ke Dashboard" className="rounded-xl">
        <Logo />
      </Link>
      <Link
        href="/accessibility"
        className="grid h-10 w-10 place-items-center rounded-xl border border-border text-fg-muted hover:bg-surface-2"
        aria-label="Pengaturan aksesibilitas"
      >
        <Accessibility className="h-5 w-5" aria-hidden />
      </Link>
    </header>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {MOBILE_NAV.map((item) => {
          const active = isActivePath(pathname, item);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold",
                  active ? "text-primary" : "text-fg-muted",
                )}
              >
                <span className={cn("grid h-7 w-12 place-items-center rounded-full", active && "bg-primary-soft")}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Alt+1…8 jumps between main sections when keyboard navigation mode is on. */
function KeyboardShortcuts() {
  const keyboard = useAppStore((s) => s.accessibility.keyboard);
  const router = useRouter();
  const [help, setHelp] = useState(false);

  useEffect(() => {
    if (!keyboard) return;
    const items = [...MAIN_NAV, ...SECONDARY_NAV].filter((i) => i.shortcut);
    function onKey(e: KeyboardEvent) {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "/" || e.key === "?") {
        e.preventDefault();
        setHelp(true);
        return;
      }
      const item = items.find((i) => i.shortcut === e.key);
      if (item) {
        e.preventDefault();
        router.push(item.href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keyboard, router]);

  if (!keyboard) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setHelp(true)}
        className="fixed bottom-20 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold text-fg shadow-pop lg:bottom-4"
      >
        <Keyboard className="h-4 w-4" aria-hidden /> Pintasan (Alt+/)
      </button>
      <Modal open={help} onClose={() => setHelp(false)} title="Pintasan keyboard" description="Gunakan kombinasi tombol berikut untuk berpindah halaman.">
        <ul className="divide-y divide-border">
          {[...MAIN_NAV, ...SECONDARY_NAV]
            .filter((i) => i.shortcut)
            .map((i) => (
              <li key={i.href} className="flex items-center justify-between py-2.5 text-sm">
                <span>{i.label}</span>
                <kbd className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-semibold">Alt + {i.shortcut}</kbd>
              </li>
            ))}
          <li className="flex items-center justify-between py-2.5 text-sm">
            <span>Pindah antar elemen</span>
            <kbd className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-semibold">Tab / Shift + Tab</kbd>
          </li>
          <li className="flex items-center justify-between py-2.5 text-sm">
            <span>Pindah antar tab/pilihan</span>
            <kbd className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-semibold">← →</kbd>
          </li>
        </ul>
      </Modal>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const session = useAppStore((s) => s.session);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !session) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, session, router, pathname]);

  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only-focusable fixed left-4 top-4 z-50 rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary shadow-pop"
      >
        Lewati ke konten utama
      </a>
      <Sidebar pathname={pathname} />
      <MobileTopbar />
      <div className="lg:pl-68">
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 outline-none sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
          {hydrated && session ? <div key={pathname} className="animate-fade-up">{children}</div> : <PageSkeleton />}
        </main>
      </div>
      <BottomNav pathname={pathname} />
      {hydrated && <KeyboardShortcuts />}
    </div>
  );
}
