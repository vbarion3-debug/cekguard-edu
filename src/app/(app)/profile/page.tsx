"use client";

import { Accessibility, ArrowRight, Award, BookOpen, ListChecks, Lock, LogOut, RotateCcw, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Segmented } from "@/components/ui/controls";
import { PageHeader, StatCard } from "@/components/ui/feedback";
import { Input, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useLearningStats } from "@/hooks/use-learning";
import { LEVELS } from "@/lib/constants/categories";
import { ROLE_LABEL } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";
import { computeAchievements } from "@/services/learning/progress";
import { useAppStore } from "@/store/app-store";

export default function ProfilePage() {
  const router = useRouter();
  const session = useAppStore((s) => s.session);
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const setLevel = useAppStore((s) => s.setLevel);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const logout = useAppStore((s) => s.logout);
  const stats = useLearningStats();
  const achievements = computeAchievements(stats.snapshot);
  const [name, setName] = useState(profile.name);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader icon={<UserRound className="h-6 w-6" />} title="Profil" description="Kelola identitas, level belajar, dan data demo." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-2xl font-extrabold text-on-primary" aria-hidden>
                {profile.name.charAt(0)}
              </span>
              <div>
                <p className="text-lg font-bold text-fg">{profile.name}</p>
                <p className="text-sm text-fg-muted">
                  {profile.className} · {profile.institution}
                </p>
                {session && <Badge tone="primary" className="mt-1">Masuk sebagai {ROLE_LABEL[session.role]}</Badge>}
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = name.trim().slice(0, 60);
                if (!trimmed) return;
                setProfile({ name: trimmed });
                setSaved(true);
              }}
            >
              <Label htmlFor="profile-name">Nama</Label>
              <div className="flex gap-2">
                <Input
                  id="profile-name"
                  value={name}
                  maxLength={60}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSaved(false);
                  }}
                />
                <Button type="submit" variant="outline" className="h-12">
                  Simpan
                </Button>
              </div>
              {saved && (
                <p role="status" className="mt-2 text-sm font-medium text-success">
                  Nama tersimpan.
                </p>
              )}
            </form>
            <div>
              <p className="mb-2 font-semibold text-fg">Learning Level</p>
              <Segmented
                label="Level belajar"
                value={profile.level}
                onChange={setLevel}
                options={LEVELS.map((l) => ({ value: l.id, label: l.label, description: l.description }))}
                className="flex-col sm:flex-col"
              />
              <p className="mt-2 text-sm text-fg-muted">Level menentukan gaya bahasa penjelasan hasil analisis, materi, dan AI Tutor.</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Digital Safety Score" value={stats.score} icon={<ShieldCheck className="h-5 w-5" />} />
            <StatCard label="Lessons Completed" value={stats.completedLessons.length} icon={<BookOpen className="h-5 w-5" />} tone="success" />
            <StatCard label="Quiz Score" value={`${stats.averageQuiz}%`} hint="rata-rata" icon={<ListChecks className="h-5 w-5" />} tone="accent" />
          </div>
          <Card>
            <CardHeader title="Achievements" icon={<Award className="h-5 w-5" />} />
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2">
                {achievements.map((a) => (
                  <li key={a.id} className={cn("flex items-center gap-3 rounded-xl border p-3", a.unlocked ? "border-success/40 bg-success-soft/50" : "border-border opacity-70")}>
                    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", a.unlocked ? "bg-success text-white" : "bg-surface-2 text-fg-muted")} aria-hidden>
                      {a.unlocked ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-fg">{a.title}</span>
                      <span className="block text-xs text-fg-muted">
                        {a.unlocked ? "Tercapai" : "Belum tercapai"} · {a.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-wrap gap-3">
              <Link href="/accessibility" className="inline-flex h-11 items-center gap-2 rounded-xl border border-border-strong px-4 text-sm font-semibold text-fg hover:bg-surface-2">
                <Accessibility className="h-4 w-4" aria-hidden /> Pengaturan aksesibilitas <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Button variant="outline" onClick={() => setConfirmReset(true)}>
                <RotateCcw className="h-4 w-4" aria-hidden /> Reset data demo
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden /> Keluar
              </Button>
            </CardContent>
          </Card>
          {resetDone && (
            <Alert tone="success" live title="Data demo dikembalikan.">
              Progress, hasil scan, dan percakapan kembali ke kondisi awal demo.
            </Alert>
          )}
        </div>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset data demo?"
        description="Progress belajar, riwayat quiz, hasil scan, dan percakapan AI Tutor akan dikembalikan ke kondisi awal demo. Pengaturan aksesibilitas tetap."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDemo();
                setName(useAppStore.getState().profile.name);
                setConfirmReset(false);
                setResetDone(true);
              }}
            >
              Ya, reset
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">Berguna untuk mengulang alur demo dari awal.</p>
      </Modal>
    </div>
  );
}
