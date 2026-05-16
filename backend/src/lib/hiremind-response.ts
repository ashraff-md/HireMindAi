import { NextResponse } from "next/server";

export function hiremindJson(
  data: unknown,
  opts?: { mock?: boolean; status?: number },
) {
  const res = NextResponse.json(data, { status: opts?.status ?? 200 });
  if (opts?.mock) {
    res.headers.set("x-hiremind-mock", "true");
  }
  return res;
}
