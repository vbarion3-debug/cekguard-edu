"use client";

import { ArrowRight, BookOpen, Building2, GraduationCap, Lightbulb, ScanSearch, ShieldCheck, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { DEMO_ACCOUNTS } from "@/data/demo/seed-user";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/store/app-store";
import type { Role } from "@/types";

const ROLE_ICON: Record<Role, typeof UserRound> = { STUDENT: UserRound, TEACHER: GraduationCap, ADMIN: Building2 };
const ROLE_HOME: Record<Role, string> = { STUDENT: "/dashboard", TEACHER: "/teacher", ADMIN: "/institution" };

const LOOP = [
  { icon: ScanSearch, title: "Detect", text: "AI membantu menemukan indikasi risiko." },
  { icon: Lightbulb, title: "Explain", text: "Penjelasan mudah dipahami, bukan sekadar label." },
  { icon: BookOpen, title: "Learn", text: "Materi dan quiz dari kasus nyata." },
  { icon: ShieldCheck, title: "Act", text: "Tindakan aman yang bisa langsung dilakukan." },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAppStore((s) => s.login);
  const [selected, setSelected] = useState<Role>("STUDENT");

  function submit() {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === selected)!;
    login({ userId: acc.userId, role: acc.role, name: acc.name });
    const next = params.get("next");
    router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : ROLE_HOME[acc.role]);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="w-full max-w-md"
    >
      <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">Masuk ke CekGuard Edu</h1>
      <p className="mt-2 text-fg-muted">Pilih akun demo untuk mencoba pengalaman sesuai peran.</p>

      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-semibold text-fg">Akun demo</legend>
        <div className="space-y-3" role="radiogroup" aria-label="Akun demo">
          {DEMO_ACCOUNTS.map((acc) => {
            const Icon = ROLE_ICON[acc.role];
            const checked = selected === acc.role;
            return (
              <label
                key={acc.role}
                className={cn(
                  "flex cursor-pointer items-center gap-4 rounded-2xl border-(length:--border-w) p-4 transition-all",
                  checked ? "border-primary bg-primary-soft ring-2 ring-primary/30" : "border-border bg-surface hover:border-border-strong",
                )}
              >
                <input
                  type="radio"
                  name="account"
                  value={acc.role}
                  checked={checked}
                  onChange={() => setSelected(acc.role)}
                  className="sr-only"
                />
                <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", checked ? "bg-primary text-on-primary" : "bg-surface-2 text-fg-muted")} aria-hidden>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-fg">{acc.title}</span>
                    <span className="text-sm text-fg-muted">· {acc.name}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-fg-muted">{acc.description}</span>
                </span>
                <span
                  aria-hidden
                  className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border-2", checked ? "border-primary" : "border-border-strong")}
                >
                  {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <button
        type="submit"
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover"
      >
        Masuk sebagai {DEMO_ACCOUNTS.find((a) => a.role === selected)?.title}
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
      <p className="mt-4 text-center text-sm text-fg-muted">
        Mode demo: tidak memerlukan kata sandi. Data progres disimpan di perangkat ini.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-primary p-12 text-on-primary lg:flex lg:flex-col lg:justify-between [[data-contrast=high]_&]:border-r-2">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-3">
          <span className="rounded-2xl bg-white p-1.5">
            <Logo compact />
          </span>
          <span className="text-xl font-extrabold">CekGuard Edu</span>
        </div>
        <div className="relative max-w-lg">
          <Badge className="border-white/30 bg-white/15 text-white">Kenali • Pahami • Lindungi</Badge>
          <p className="mt-5 text-4xl font-extrabold leading-tight">AI yang mengubah ancaman digital menjadi pengalaman belajar.</p>
          <p className="mt-4 text-lg text-white/85">
            Periksa konten digital, pahami alasannya, pelajari polanya, lalu ambil tindakan yang lebih aman.
          </p>
          <ol className="mt-8 grid grid-cols-2 gap-3">
            {LOOP.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <span className="flex items-center gap-2 font-bold">
                  <s.icon className="h-5 w-5" aria-hidden />
                  {i + 1}. {s.title}
                </span>
                <span className="mt-1 block text-sm text-white/80">{s.text}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="relative text-sm text-white/70">Prototipe kompetisi Software Development · Data yang ditampilkan adalah data demo.</p>
      </section>
      <section className="flex flex-col items-center justify-center bg-bg px-4 py-10 sm:px-8">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </div>
  );
}
