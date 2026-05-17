import { hiremindJson } from "@/lib/hiremind-response";
import { requireBearerUser } from "@/lib/supabase-auth";
import {
  ensurePublicUser,
  getInterviewMonthlyUsageForUser,
} from "@/services/interview.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireBearerUser(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    await ensurePublicUser(auth.user.id);
    const usage = await getInterviewMonthlyUsageForUser(auth.user.id);
    return hiremindJson({
      plan: usage.plan,
      usedThisUtcMonth: usage.usedThisUtcMonth,
      freeMonthlyLimit: usage.freeMonthlyLimit,
      remainingFreeThisMonth:
        usage.plan === "premium"
          ? null
          : Math.max(0, usage.freeMonthlyLimit - usage.usedThisUtcMonth),
    });
  } catch (err) {
    console.error(err);
    return hiremindJson(
      { error: "monthly_usage_failed" },
      { status: 500 },
    );
  }
}
