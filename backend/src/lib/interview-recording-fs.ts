import { createReadStream } from "fs";
import { mkdir, stat, writeFile } from "fs/promises";
import path from "path";

import { Readable } from "node:stream";

const DEFAULT_SEGMENTS = ["data", "interview-recordings"] as const;

export function getInterviewRecordingsRoot(): string {
  const raw = process.env.INTERVIEW_RECORDINGS_DIR?.trim();
  if (raw) {
    return path.resolve(raw);
  }
  return path.join(process.cwd(), ...DEFAULT_SEGMENTS);
}

export async function ensureInterviewRecordingsRoot(): Promise<string> {
  const root = getInterviewRecordingsRoot();
  /** Base dir only — per-user folders are created when saving. */
  await mkdir(root, { recursive: true });
  return root;
}

/** Canonical path fragment stored in `interviews.user_recording_object_path`. */
export function interviewRecordingRelativePath(
  userId: string,
  interviewId: string,
  ext: string,
): string {
  return `${userId}/${interviewId}/user-answers.${ext}`;
}

function contentTypeForFile(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".webm") return "audio/webm";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".m4a" || ext === ".mp4") return "audio/mp4";
  return "application/octet-stream";
}

/** Resolve `relative` under recordings root; rejects traversal. */
export function absolutePathUnderRecordingsRoot(relative: string): string | null {
  const rel = relative.replace(/\\/g, "/").trim();
  if (!rel || rel.includes("..")) {
    return null;
  }
  const root = path.resolve(getInterviewRecordingsRoot());
  const resolved = path.resolve(root, rel);
  const relToRoot = path.relative(root, resolved);
  if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot)) {
    return null;
  }
  return resolved;
}

export async function saveInterviewRecordingFile(args: {
  userId: string;
  interviewId: string;
  ext: string;
  buffer: Buffer;
}): Promise<string> {
  const root = await ensureInterviewRecordingsRoot();
  const rel = interviewRecordingRelativePath(
    args.userId,
    args.interviewId,
    args.ext,
  );
  const abs = path.join(root, rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, args.buffer);
  return rel;
}

export async function openLocalInterviewRecordingStream(storedRelativePath: string): Promise<{
  stream: ReturnType<typeof createReadStream>;
  contentType: string;
  size: number;
} | null> {
  const abs = absolutePathUnderRecordingsRoot(storedRelativePath);
  if (!abs) {
    return null;
  }
  try {
    const st = await stat(abs);
    if (!st.isFile()) {
      return null;
    }
    return {
      stream: createReadStream(abs),
      contentType: contentTypeForFile(abs),
      size: st.size,
    };
  } catch {
    return null;
  }
}

/** Supabase fallback: buffer entire object (legacy bucket paths). */
export async function loadInterviewRecordingFromSupabaseBuffer(args: {
  objectPath: string;
}): Promise<{ buffer: Buffer; contentType: string } | null> {
  const { getSupabaseAdmin } = await import("@/lib/supabase");
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from("interview-audio")
    .download(args.objectPath);

  if (error || !data) {
    return null;
  }

  const buf = Buffer.from(await data.arrayBuffer());
  const ct =
    typeof data.type === "string" && data.type.trim()
      ? data.type
      : "application/octet-stream";
  return { buffer: buf, contentType: ct };
}

export function bufferToWebReadableStream(buf: Buffer): ReadableStream<Uint8Array> {
  return Readable.toWeb(Readable.from(buf)) as ReadableStream<Uint8Array>;
}
