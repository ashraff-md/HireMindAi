import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";

import { AppChrome } from "@/components/app-chrome";
import { AuthHydrator } from "@/components/auth-hydrator";
import { PageShell } from "@/components/page-shell";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HireMind AI — Voice Interview Coach",
  description:
    "Practice realistic recruiter interviews with AI-powered voice and instant feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${display.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider>
          <AuthHydrator />
          <PageShell>
            <AppChrome>{children}</AppChrome>
          </PageShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
