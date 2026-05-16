/**
 * Credit and contact for team T-REX on legal pages.
 * Set NEXT_PUBLIC_TEAM_TREX_CONTACT_EMAIL in `.env.local` to show a mailto link.
 */
export function LegalTrexContact() {
  const email = process.env.NEXT_PUBLIC_TEAM_TREX_CONTACT_EMAIL?.trim();

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-relaxed">
      <p className="font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Build team
      </p>
      <p className="text-muted-foreground">
        HireMind AI is <strong className="font-medium text-foreground">designed and developed by team T-REX</strong>{" "}
        for the Cursor Colombo Buildathon 2026, alongside TechTalk360.
      </p>
      <p className="text-muted-foreground">
        <strong className="font-medium text-foreground">Contact:</strong>{" "}
        {email ? (
          <a
            href={`mailto:${email}`}
            className="text-foreground underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-[var(--hm-neon-from)]"
          >
            {email}
          </a>
        ) : (
          <>
            For T-REX or build-team inquiries, reach TechTalk360 / HireMind AI through your usual product
            support channel, or contact the Cursor Colombo Buildathon 2026 organizers and reference{" "}
            <strong className="font-medium text-foreground">team T-REX</strong>.
          </>
        )}
      </p>
    </div>
  );
}
