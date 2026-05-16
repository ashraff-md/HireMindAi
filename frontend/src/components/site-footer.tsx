import Link from "next/link";

import { FooterAccountLinks } from "@/components/footer-account-links";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[oklch(0.12_0.02_285)]/90 backdrop-blur-xl dark:bg-black/50">
      <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 md:col-span-2 lg:col-span-1">
          <p className="font-display text-lg font-semibold tracking-tight">
            HireMind<span className="hm-text-neon"> AI</span>
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Voice-native mock interviews with recruiter-grade pacing — rehearse pressure,
            sharpen answers, ship confident stories.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">Product</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/#features" className="hover:text-foreground">
                Features
              </Link>
            </li>
            <li>
              <Link href="/interview/setup" className="hover:text-foreground">
                Launch interview
              </Link>
            </li>
            <li>
              <Link href="/analytics" className="hover:text-foreground">
                Analytics
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">Account</p>
          <ul className="space-y-2 text-muted-foreground">
            <FooterAccountLinks />
          </ul>
        </div>

        <div className="space-y-3 text-sm md:col-span-2 lg:col-span-1">
          <p className="font-medium text-foreground">Legal</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                Terms of service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <p className="mx-auto max-w-6xl px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground md:text-left">
          © 2026 TechTalk360 · HireMind AI · Cursor Colombo Buildathon 2026 · Designed and Developed by
          T-REX
        </p>
      </div>
    </footer>
  );
}
