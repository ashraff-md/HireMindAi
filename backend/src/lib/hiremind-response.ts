import { NextResponse } from "next/server";

export function hiremindJson(
  data: unknown,
  opts?: {
    mock?: boolean;
    status?: number;
    headers?: Record<string, string>;
  },
) {
  const res = NextResponse.json(data, { status: opts?.status ?? 200 });
  if (opts?.mock) {
    res.headers.set("x-hiremind-mock", "true");
  }
  if (opts?.headers) {
    for (const [key, value] of Object.entries(opts.headers)) {
      if (value?.trim()) {
        res.headers.set(key, value);
      }
    }
  }
  return res;
}
