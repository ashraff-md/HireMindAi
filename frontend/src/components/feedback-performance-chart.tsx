"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { HmCard } from "@/components/hm-card";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  score: number;
  communicationScore: number;
  confidenceScore: number;
  technicalScore: number;
};

const axisStroke = "oklch(0.72 0.06 285 / 0.35)";
const gridStroke = "oklch(0.72 0.06 285 / 0.2)";
const fillNeon = "var(--hm-neon-from)";
const strokeNeon = "var(--hm-neon-to)";

export function FeedbackPerformanceCharts({
  score,
  communicationScore,
  confidenceScore,
  technicalScore,
}: Props) {
  const radarData = [
    { axis: "Communication", value: communicationScore },
    { axis: "Confidence", value: confidenceScore },
    { axis: "Technical", value: technicalScore },
    { axis: "Composite", value: score },
  ];

  const barData = [
    { name: "Communication", score: communicationScore },
    { name: "Confidence", score: confidenceScore },
    { name: "Technical", score: technicalScore },
    { name: "Overall", score: score },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <HmCard className="gap-4 p-5 lg:p-6">
        <CardHeader className="p-0">
          <CardTitle className="font-display text-lg">Skill radar</CardTitle>
          <CardDescription>
            Relative weights across dimensions — neon overlay maps HireMind scoring lanes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="52%" outerRadius="72%" data={radarData}>
                <PolarGrid stroke={gridStroke} />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke={strokeNeon}
                  fill={fillNeon}
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.72 0.06 285 / 0.25)",
                    background: "oklch(0.18 0.03 285 / 0.92)",
                    color: "var(--foreground)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </HmCard>

      <HmCard className="gap-4 p-5 lg:p-6">
        <CardHeader className="p-0">
          <CardTitle className="font-display text-lg">Score breakdown</CardTitle>
          <CardDescription>
            Bar contrast for export-friendly snapshots (PDF stub coming soon).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={{ stroke: axisStroke }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={{ stroke: axisStroke }}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  cursor={{ fill: "oklch(0.72 0.06 285 / 0.06)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.72 0.06 285 / 0.25)",
                    background: "oklch(0.18 0.03 285 / 0.92)",
                    color: "var(--foreground)",
                  }}
                />
                <Bar
                  dataKey="score"
                  radius={[10, 10, 4, 4]}
                  fill="url(#hmBarGradient)"
                  stroke={strokeNeon}
                  strokeWidth={1}
                />
                <defs>
                  <linearGradient id="hmBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--hm-neon-from)" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="var(--hm-neon-to)" stopOpacity={0.35} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </HmCard>
    </div>
  );
}
