"use client";

import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { DEMO_ACCOUNTS } from "@/data/demo/seed-user";
import { ROLE_LABEL } from "@/lib/constants/navigation";
import { useAppStore } from "@/store/app-store";
import type { Role } from "@/types";

/** Client-side role gate for the prototype (a production build enforces this on the server). */
export function RoleGuard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const session = useAppStore((s) => s.session);
  const login = useAppStore((s) => s.login);
  if (session && roles.includes(session.role)) return <>{children}</>;
  const target = DEMO_ACCOUNTS.find((a) => a.role === roles[0])!;
  return (
    <EmptyState
      titleAs="h1"
      icon={<ShieldAlert className="h-6 w-6" />}
      title="Halaman ini khusus untuk peran tertentu"
      description={`Halaman ini dapat diakses oleh: ${roles.map((r) => ROLE_LABEL[r]).join(", ")}. Kamu dapat beralih ke akun demo yang sesuai.`}
      action={
        <Button onClick={() => login({ userId: target.userId, role: target.role, name: target.name })}>
          Beralih ke akun demo {target.title}
        </Button>
      }
    />
  );
}
