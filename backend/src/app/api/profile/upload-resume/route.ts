import pdfParse from "pdf-parse";

import { hiremindJson } from "@/lib/hiremind-response";
import { shouldUseMockAi } from "@/lib/mock";
import { aiParseResume } from "@/services/ai.service";
import { getSupabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
  userId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const userIdRaw = form.get("userId");
    const pdf = form.get("pdf");

    const parsed = BodySchema.safeParse({
      userId: typeof userIdRaw === "string" ? userIdRaw : "",
    });

    if (!parsed.success) {
      return hiremindJson(
        { error: "invalid_user_id", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (!(pdf instanceof File)) {
      return hiremindJson({ error: "pdf_required" }, { status: 400 });
    }

    if (pdf.type !== "application/pdf") {
      return hiremindJson({ error: "pdf_only" }, { status: 415 });
    }

    const supabase = getSupabaseAdmin();

    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("plan_type")
      .eq("id", parsed.data.userId)
      .maybeSingle();

    if (userErr) {
      throw userErr;
    }

    const profileAccess = userRow as { plan_type?: string | null } | null;

    if (!profileAccess) {
      return hiremindJson({ error: "user_not_found" }, { status: 404 });
    }

    if (profileAccess.plan_type !== "premium") {
      return hiremindJson(
        { error: "premium_required" },
        { status: 403 },
      );
    }

    const buffer = Buffer.from(await pdf.arrayBuffer());

    const text = await pdfParse(buffer).then((r: { text: string }) =>
      String(r?.text ?? "")
    ).catch(() => "");

    if (!text.trim()) {
      return hiremindJson({ error: "pdf_text_empty" }, { status: 422 });
    }

    const resumeProfile = await aiParseResume(text);

    const resumeKey = `${parsed.data.userId}/resume.pdf`;
    const { error: uploadError } = await supabase.storage.from("resumes").upload(
      resumeKey,
      buffer,
      {
        contentType: "application/pdf",
        upsert: true,
      },
    );

    if (uploadError) {
      throw uploadError;
    }

    const mergedExperience = [
      ...resumeProfile.experience,
      ...resumeProfile.projects.map((p) => `[project] ${p}`),
    ];

    const { error: upsertErr } = await supabase.from("profiles").upsert(
      {
        user_id: parsed.data.userId,
        skills: resumeProfile.skills,
        education: resumeProfile.education,
        experience: mergedExperience,
        target_role: resumeProfile.target_role ?? null,
        resume_url: resumeKey,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

    if (upsertErr) {
      throw upsertErr;
    }

    return hiremindJson(
      {
        resumeUrlKey: resumeKey,
        extracted: {
          skills: resumeProfile.skills,
          education: resumeProfile.education,
          experience: mergedExperience,
          target_role: resumeProfile.target_role ?? null,
        },
      },
      { mock: shouldUseMockAi() },
    );
  } catch (err) {
    console.error(err);

    return hiremindJson({ error: "resume_upload_failed" }, { status: 500 });
  }
}
