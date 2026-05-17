"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";

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
import { JOB_ROLES, type JobRole } from "@/lib/interview-options";
import type { ResumeUploadSuccess } from "@/lib/resume-api";
import { uploadResumePdf } from "@/lib/resume-api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";

function isListedJobRole(s: string): s is JobRole {
  return (JOB_ROLES as readonly string[]).includes(s);
}

export default function ProfilePage() {
  const uid = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const plan = useAuthStore((s) => s.plan);
  const userId = useAuthStore((s) => s.userId);
  const premium = plan === "premium";
  const { name, skills, education, targetRole, patch } = useProfileStore();
  const [extracted, setExtracted] = useState<ResumeUploadSuccess["extracted"] | null>(
    null,
  );
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadOk, setUploadOk] = useState<string | null>(null);

  async function onPickPdf(file: File | null) {
    setUploadError(null);
    setUploadOk(null);
    if (!file || !userId) return;

    setUploadBusy(true);
    try {
      const data = await uploadResumePdf({ userId, pdf: file });
      setExtracted(data.extracted);
      const skillText = data.extracted.skills.join(" · ");
      const expBlock =
        data.extracted.experience.length > 0
          ? `\n\n${data.extracted.experience.join("\n")}`
          : "";
      patch({
        skills: `${skillText}${expBlock}`.trim(),
        education: data.extracted.education.join("\n"),
        targetRole: data.extracted.target_role?.trim() && isListedJobRole(data.extracted.target_role.trim())
          ? data.extracted.target_role.trim()
          : (data.extracted.target_role?.trim() ||
              (isListedJobRole(targetRole) ? targetRole : JOB_ROLES[0])),
      });
      setUploadOk("Resume imported — review your manual profile below.");
    } catch (e) {
      setExtracted(null);
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploadBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const headline =
    extracted?.target_role?.trim() || "AI extraction — your resume signals";
  const previewLines: string[] = extracted
    ? [
        ...extracted.skills.slice(0, 4),
        ...extracted.experience.slice(0, 3),
        ...extracted.education.slice(0, 2),
      ].filter(Boolean)
    : [];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-[2.75rem]">
            Candidate dossier
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Manual intake powers free-tier personalization — premium lane streams structured signals
            after resume ingestion.
          </p>
        </div>
        <Badge variant="secondary" className="rounded-full px-4 py-1 uppercase tracking-[0.14em]">
          Plan · {plan}
        </Badge>
      </div>

      <HmCard className="gap-6 p-6 md:p-8">
        <CardHeader className="p-0">
          <CardTitle className="font-display text-xl">Manual profile</CardTitle>
          <CardDescription>Persisted locally — sync your dossier after resume import fills these fields.</CardDescription>
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
              value={isListedJobRole(targetRole) ? targetRole : JOB_ROLES[0]}
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
            {!isListedJobRole(targetRole) && targetRole?.trim() ? (
              <p className="text-xs text-muted-foreground">
                Imported target: <span className="text-foreground">{targetRole}</span> (pick closest
                role above or edit skills to reflect it)
              </p>
            ) : null}
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
            Upload a PDF — the backend parses it and updates your Supabase profile plus the fields
            here.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("space-y-4 p-0", !premium && "pointer-events-none select-none blur-[2px]")}>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => void onPickPdf(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            disabled={!premium || uploadBusy || !userId}
            className="rounded-xl"
            variant={premium ? "default" : "secondary"}
            onClick={() => fileRef.current?.click()}
          >
            {uploadBusy ? "Uploading…" : "Upload resume PDF"}
          </Button>
          {uploadError ? (
            <p className="text-sm text-destructive">{uploadError}</p>
          ) : null}
          {uploadOk ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{uploadOk}</p> : null}
          <Separator />
          <div className="rounded-2xl border border-[var(--hm-neon-from)]/35 bg-black/35 p-5 backdrop-blur-xl dark:bg-black/55">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--hm-neon-from)]">
              AI extraction preview
            </p>
            <p className="mt-3 font-display text-lg font-semibold">{headline}</p>
            {previewLines.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {previewLines.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--hm-neon-from)]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Upload a resume to see extracted skills, experience, and education highlights here.
              </p>
            )}
          </div>
        </CardContent>
        {!premium ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-gradient-to-t from-background via-background/75 to-transparent">
            <Link
              href="/upgrade"
              className="pointer-events-auto rounded-full border border-white/15 bg-background/85 px-6 py-3 text-xs uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-xl transition-colors hover:text-foreground"
            >
              Unlock via Premium checkout
            </Link>
          </div>
        ) : null}
      </HmCard>
    </div>
  );
}
