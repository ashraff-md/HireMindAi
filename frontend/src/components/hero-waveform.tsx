"use client";

import { InterviewWaveform } from "@/components/interview-waveform";

export function HeroWaveform({ active = true }: { active?: boolean }) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl hm-panel-glow">
      <InterviewWaveform active={active} variant="ai" size="cinema" className="w-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
