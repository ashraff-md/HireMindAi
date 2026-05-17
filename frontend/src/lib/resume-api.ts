"use client";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
}

export type ResumeUploadSuccess = {
  resumeUrlKey: string;
  extracted: {
    skills: string[];
    education: string[];
    experience: string[];
    target_role: string | null;
  };
};

export async function uploadResumePdf(args: {
  userId: string;
  pdf: File;
}): Promise<ResumeUploadSuccess> {
  const base = apiBase();
  const url = base ? `${base}/api/profile/upload-resume` : "/api/profile/upload-resume";

  const form = new FormData();
  form.set("userId", args.userId);
  form.set("pdf", args.pdf);

  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try {
      const j = (await res.json()) as { error?: string };
      if (typeof j.error === "string" && j.error.trim()) {
        msg = j.error.trim();
      }
    } catch {
      /* keep msg */
    }
    if (msg === "premium_required") {
      throw new Error("Premium is required to upload a resume.");
    }
    if (msg === "pdf_only") {
      throw new Error("Please choose a PDF file.");
    }
    if (msg === "pdf_text_empty") {
      throw new Error("Could not read text from this PDF. Try another export.");
    }
    throw new Error(msg);
  }

  return (await res.json()) as ResumeUploadSuccess;
}
