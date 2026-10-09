import { Compass } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-primary-soft text-primary" aria-hidden>
        <Compass className="h-8 w-8" />
      </span>
      <div>
        <h1 className="text-2xl font-extrabold text-fg">Halaman tidak ditemukan</h1>
        <p className="mt-2 max-w-md text-fg-muted">Alamat yang kamu buka tidak tersedia. Mungkin tautannya salah atau halaman sudah dipindahkan.</p>
      </div>
      <ButtonLink href="/dashboard" size="lg">
        Kembali ke Dashboard
      </ButtonLink>
    </main>
  );
}
