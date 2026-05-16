import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — HireMind AI",
  description:
    "Terms and conditions for using HireMind AI voice interview practice software and related services.",
};

export default function TermsPage() {
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
          Terms of service
        </h1>
        <p className="text-sm text-muted-foreground">Last updated: May 16, 2026</p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-foreground md:text-[15px]">
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Agreement
          </h2>
          <p className="text-muted-foreground">
            By accessing or using HireMind AI (“Service”) operated by TechTalk360, you agree to these
            Terms. If you do not agree, do not use the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            The Service
          </h2>
          <p className="text-muted-foreground">
            HireMind AI provides practice interview experiences, including AI-generated prompts, feedback,
            and optional voice features. Output is educational and preparatory; it is not a guarantee of
            hiring outcomes, human recruiter behavior, or legal or professional advice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">Accounts</h2>
          <p className="text-muted-foreground">
            You are responsible for your account credentials and for activity under your account. You
            agree to provide accurate information and to notify us of unauthorized use where reasonable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Acceptable use
          </h2>
          <p className="text-muted-foreground">You agree not to:</p>
          <ul className="list-inside list-disc space-y-2 text-muted-foreground">
            <li>Use the Service in violation of law or third-party rights.</li>
            <li>Attempt to probe, disrupt, or overload our systems or other users’ access.</li>
            <li>Misrepresent outputs as official communications from employers or institutions.</li>
            <li>Use the Service to generate harmful, unlawful, or abusive content at scale.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Intellectual property
          </h2>
          <p className="text-muted-foreground">
            The Service, branding, and software are owned by TechTalk360 and its licensors. We grant you a
            limited, non-exclusive, non-transferable license to use the Service for personal or internal
            business preparation, subject to these Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Disclaimers
          </h2>
          <p className="text-muted-foreground">
            THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW,
            WE DISCLAIM WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT. AI-generated content may be inaccurate or incomplete; you are responsible
            for how you rely on it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Limitation of liability
          </h2>
          <p className="text-muted-foreground">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, TECHTALK360 AND HIREMIND AI WILL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA,
            OR GOODWILL. OUR AGGREGATE LIABILITY ARISING OUT OF THE SERVICE WILL NOT EXCEED THE GREATER OF
            (A) THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) ONE
            HUNDRED U.S. DOLLARS (IF NO FEES APPLIED).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Changes and termination
          </h2>
          <p className="text-muted-foreground">
            We may modify the Service or these Terms. We may suspend or terminate access for conduct that
            we believe violates these Terms or harms the Service. Provisions that by nature should survive
            will survive termination.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Governing law
          </h2>
          <p className="text-muted-foreground">
            These Terms are governed by the laws applicable to TechTalk360’s operating jurisdiction,
            without regard to conflict-of-law rules, unless local consumer rules require otherwise.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">Contact</h2>
          <p className="text-muted-foreground">
            For questions about these Terms, contact your TechTalk360 / HireMind AI support channel.
          </p>
        </section>

        <p className="border-t border-white/10 pt-8 text-xs text-muted-foreground">
          These Terms are a general template for a buildathon product and should be reviewed by qualified
          counsel before production use.
        </p>
      </div>
    </article>
  );
}
