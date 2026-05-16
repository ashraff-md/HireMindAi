import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-30%,oklch(0.62_0.26_286/0.35),transparent_58%),radial-gradient(ellipse_80%_55%_at_95%_40%,oklch(0.58_0.22_252/0.22),transparent_52%),radial-gradient(ellipse_70%_50%_at_5%_85%,oklch(0.58_0.18_232/0.14),transparent_48%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_50%_-28%,oklch(0.62_0.26_286/0.45),transparent_55%),radial-gradient(ellipse_85%_55%_at_100%_35%,oklch(0.58_0.22_252/0.28),transparent_50%),radial-gradient(ellipse_75%_55%_at_0%_90%,oklch(0.55_0.16_232/0.18),transparent_48%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background" />
        <div className="hm-noise absolute inset-0 opacity-[0.35] mix-blend-overlay dark:opacity-[0.5]" />
      </div>
      <div className="relative flex min-h-screen flex-col">{children}</div>
    </>
  );
}
