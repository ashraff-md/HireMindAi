import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — HireMind AI",
  description:
    "How HireMind AI collects, uses, and protects your information when you use our voice interview practice product.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-10 pb-16 md:pb-20">
      <header className="space-y-3 border-b border-white/10 pb-8">
        <Link
          href="/"
          className="inline-block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Home
        </Link>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-[2rem]">
          Privacy policy
        </h1>
        <p className="text-sm text-muted-foreground">Last updated: May 16, 2026</p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-foreground md:text-[15px]">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Who we are
          </h2>
          <p className="text-muted-foreground">
            HireMind AI (“HireMind,” “we,” “us”) is operated by TechTalk360 as part of the HireMind AI
            product. This policy describes how we handle personal information when you use our websites
            and services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Information we collect
          </h2>
          <ul className="list-inside list-disc space-y-2 text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">Account data.</strong> When you sign up or
              sign in, we process information such as your email address and authentication identifiers
              through our identity provider (for example Supabase Auth).
            </li>
            <li>
              <strong className="font-medium text-foreground">Interview content.</strong> Text you submit
              during practice sessions, generated questions and feedback, and related session metadata may
              be stored to provide the service and improve your experience.
            </li>
            <li>
              <strong className="font-medium text-foreground">Voice and browser features.</strong> Where
              you enable them, your browser may process microphone audio for speech-to-text or level
              visualization. Camera preview, if enabled, is intended for local display in your browser and
              is not used to record or upload video unless we clearly state otherwise in the product.
            </li>
            <li>
              <strong className="font-medium text-foreground">Technical data.</strong> Standard logs and
              diagnostics (device/browser type, approximate region, timestamps) help us secure and operate
              the service.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            How we use information
          </h2>
          <p className="text-muted-foreground">
            We use information to provide and improve HireMind AI, authenticate users, generate interview
            prompts and feedback, maintain security, comply with law, and communicate about the product.
            We do not sell your personal information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            AI and service providers
          </h2>
          <p className="text-muted-foreground">
            Parts of the service may rely on third-party infrastructure or models (for example cloud
            hosting, databases, and AI providers) to generate text or voice. Those providers process data
            according to their terms and our agreements, only as needed to operate features you use.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Retention and security
          </h2>
          <p className="text-muted-foreground">
            We retain information for as long as your account is active or as needed to provide the
            service, comply with legal obligations, resolve disputes, and enforce our agreements. We use
            commercially reasonable safeguards; no method of transmission over the Internet is completely
            secure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Your choices
          </h2>
          <p className="text-muted-foreground">
            Depending on your region, you may have rights to access, correct, delete, or export personal
            data, or to object to certain processing. Contact us using the details below and we will
            respond within a reasonable time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Children
          </h2>
          <p className="text-muted-foreground">
            HireMind AI is not directed at children under 13, and we do not knowingly collect personal
            information from them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">Changes</h2>
          <p className="text-muted-foreground">
            We may update this policy from time to time. We will post the updated version on this page and
            adjust the “Last updated” date above.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">Contact</h2>
          <p className="text-muted-foreground">
            Questions about privacy: reach your TechTalk360 / HireMind AI contact or support channel, or
            use the information provided on the marketing site once published.
          </p>
        </section>

        <p className="border-t border-white/10 pt-8 text-xs text-muted-foreground">
          This policy is provided for general information and does not constitute legal advice. For
          product-specific data practices, refer to in-app notices and your account settings.
        </p>
      </div>
    </article>
  );
}
