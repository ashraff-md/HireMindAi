import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Analytics — Performance insight | HireMind AI",
  },
  description:
    "HireMind AI analytics: readiness scores, core metrics, strengths, improvement areas, and technical deep-dive correlation for interview simulations.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function AnalyticsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
