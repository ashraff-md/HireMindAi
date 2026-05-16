"use client";

import { useId } from "react";

import { HmCard } from "@/components/hm-card";
import { LockedFeatureBadge } from "@/components/locked-feature-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { JOB_ROLES } from "@/lib/interview-options";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";

const MOCK_RESUME_INSIGHT = {
  headline: "Staff-level IC trajectory · AI-first shipping",
  signals: [
    "Distributed systems fluency across Edge + regional failover drills.",
    "Repeatedly paired ambiguous mandates with ROI narratives.",
    "Mentorship throughput cited across three promotion packets.",
  ],
};

export default function ProfilePage() {
  const uid = useId();
  const plan = useAuthStore((s) => s.plan);
  const premium = plan === "premium";
  const { name, skills, education, targetRole, patch } = useProfileStore();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]">
            Candidate dossier
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Manual intake powers free-tier personalization — premium lane streams structured signals after resume ingestion lands server-side.
          </p>
        </div>
        <Badge variant="secondary" className="rounded-full px-4 py-1 uppercase tracking-[0.14em]">
          Plan · {plan}
        </Badge>
      </div>

      <HmCard className="gap-6 p-6 md:p-8">
        <CardHeader className="p-0">
          <CardTitle className="font-display text-xl">Manual profile</CardTitle>
          <CardDescription>Persisted locally for hackathon UX until profiles API arrives.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-0 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${uid}-name`}>Name</Label>
            <Input
              id={`${uid}-name`}
              value={name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Alex Rivera"
              className="rounded-xl bg-background/60 backdrop-blur-md"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${uid}-skills`}>Skills</Label>
            <Textarea
              id={`${uid}-skills`}
              value={skills}
              onChange={(e) => patch({ skills: e.target.value })}
              placeholder="Next.js · streaming inference · Postgres · observability..."
              rows={3}
              className="rounded-xl bg-background/60 backdrop-blur-md"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${uid}-education`}>Education</Label>
            <Textarea
              id={`${uid}-education`}
              value={education}
              onChange={(e) => patch({ education: e.target.value })}
              placeholder="M.Sc. Human-Computer Interaction — focused on conversational UX metrics."
              rows={2}
              className="rounded-xl bg-background/60 backdrop-blur-md"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${uid}-role`}>Target role</Label>
            <select
              id={`${uid}-role`}
              value={targetRole || JOB_ROLES[0]}
              onChange={(e) => patch({ targetRole: e.target.value })}
              className={cn(
                "flex h-10 w-full rounded-xl border border-input bg-background/70 px-3 text-sm backdrop-blur-md outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/45 dark:bg-background/35",
              )}
            >
              {JOB_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="outline" className="md:col-span-2 rounded-xl">
            Save profile snapshot (local only)
          </Button>
        </CardContent>
      </HmCard>

      <HmCard className="relative gap-6 overflow-hidden p-6 md:p-8">
        {!premium ? <LockedFeatureBadge className="absolute right-6 top-6 z-10" /> : null}
        <CardHeader className={cn("p-0", !premium && "opacity-70")}>
          <CardTitle className="font-display text-xl">Premium · Resume orbit</CardTitle>
          <CardDescription>
            PDF ingestion routes through{" "}
            <code className="text-xs">POST /api/profile/upload-resume</code> once PayHere upgrades flip{" "}
            <code className="text-xs">plan_type</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("space-y-4 p-0", !premium && "pointer-events-none select-none blur-[2px]")}>
          <Button disabled={!premium} className="rounded-xl" variant={premium ? "default" : "secondary"}>
            Upload resume PDF
          </Button>
          <Separator />
          <div className="rounded-2xl border border-[var(--hm-neon-from)]/35 bg-black/35 p-5 backdrop-blur-xl dark:bg-black/55">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--hm-neon-from)]">
              AI extraction preview
            </p>
            <p className="mt-3 font-display text-lg font-semibold">{MOCK_RESUME_INSIGHT.headline}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {MOCK_RESUME_INSIGHT.signals.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--hm-neon-from)]" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        {!premium ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-gradient-to-t from-background via-background/75 to-transparent">
            <p className="rounded-full border border-white/15 bg-background/85 px-6 py-3 text-xs uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-xl">
              Unlock via Premium checkout
            </p>
          </div>
        ) : null}
      </HmCard>
    </div>
  );
}
