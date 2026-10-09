"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogoMark } from "@/components/brand/logo";
import { useAppStore } from "@/store/app-store";

export default function Home() {
  const router = useRouter();
  const session = useAppStore((s) => s.session);
  useEffect(() => {
    router.replace(session ? "/dashboard" : "/login");
  }, [router, session]);
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-label="Memuat CekGuard Edu">
      <LogoMark className="h-14 w-14 animate-pulse" />
    </div>
  );
}
