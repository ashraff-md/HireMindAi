"use client";

import type { RefObject } from "react";

import { cn } from "@/lib/utils";

const OUTLINE_BARS = 52;

/** Fixed media frame: 16:9 so layout does not jump when toggling camera. */
const MEDIA_FRAME =
  "aspect-video w-full max-h-[min(42vh,340px)] max-w-xl rounded-2xl bg-black/45";

/** Radial bars on a circle — behind the avatar, only the ring. */
function CircularVoiceOutline({
  micLevel,
  rInner,
}: {
  micLevel: number;
  rInner: number;
}) {
  const level = Math.min(1, Math.max(0, micLevel * 1.15 + 0.08));

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 size-full"
      viewBox="-50 -50 100 100"
      aria-hidden
    >
      {Array.from({ length: OUTLINE_BARS }, (_, i) => {
        const a = (i / OUTLINE_BARS) * 2 * Math.PI - Math.PI / 2;
        const wobble =
          0.55 + 0.45 * Math.abs(Math.sin(i * 1.17 + level * 3.1));
        const bump = 3 + level * 11 * wobble;
        const r2 = rInner + bump;
        const x1 = Math.cos(a) * rInner;
        const y1 = Math.sin(a) * rInner;
        const x2 = Math.cos(a) * r2;
        const y2 = Math.sin(a) * r2;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="oklch(0.72 0.16 165 / 0.9)"
            strokeWidth={1.35}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function UserPresenceOrb({
  cameraOn,
  videoRef,
  cameraError,
  userWaveActive,
  micMuted,
  micLevel,
  userInitials = "—",
  elapsedSeconds,
  userLabel = "You",
  className,
  mediaOnly = false,
}: {
  cameraOn: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraError: string | null;
  userWaveActive: boolean;
  micMuted: boolean;
  micLevel: number;
  userInitials?: string;
  elapsedSeconds: number;
  userLabel?: string;
  className?: string;
  mediaOnly?: boolean;
}) {
  const showVoiceOutline = !cameraOn && !micMuted && userWaveActive;

  function formatMmSs(totalSec: number) {
    const sec = Math.max(0, Math.floor(totalSec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const media = (
    <div
      className={cn(
        "relative flex w-full items-center justify-center",
        mediaOnly && className,
      )}
    >
      <div className={cn("relative overflow-hidden", MEDIA_FRAME)}>
        {cameraOn ? (
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover [transform:scaleX(-1)]"
            playsInline
            muted
            autoPlay
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative isolate flex size-[9.5rem] items-center justify-center md:size-[12.5rem]">
              {showVoiceOutline ? (
                <CircularVoiceOutline micLevel={micLevel} rInner={42} />
              ) : null}
              <div
                className={cn(
                  "relative z-10 flex size-32 items-center justify-center overflow-hidden rounded-full bg-black/45 md:size-44",
                )}
              >
                <span
                  className="font-display text-2xl font-semibold tracking-tight text-white/85 md:text-[1.65rem]"
                  aria-hidden
                >
                  {(userInitials || "—").slice(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (mediaOnly) {
    return media;
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {media}
      <div className="text-center">
        <p className="font-mono text-xs tabular-nums text-white/55">{formatMmSs(elapsedSeconds)}</p>
        <p className="font-display text-sm font-semibold tracking-tight text-foreground">{userLabel}</p>
        {cameraOn && cameraError ? (
          <p className="mt-1 max-w-[16rem] text-xs text-amber-400" role="status">
            {cameraError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
