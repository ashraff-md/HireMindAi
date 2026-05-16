import { hiremindJson } from "@/lib/hiremind-response";
import { PayHereInitSchema } from "@/lib/schemas";
import { getSupabaseAdmin } from "@/lib/supabase";
import { initiatePremiumCheckoutSession } from "@/services/payment.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = PayHereInitSchema.safeParse(body);

    if (!parsed.success) {
      return hiremindJson(
        { error: "invalid_body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    let email = parsed.data.email;

    if (!email) {
      const supabase = getSupabaseAdmin();
      const { data: userRow, error } = await supabase
        .from("users")
        .select("email")
        .eq("id", parsed.data.userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const fetched = userRow as { email: string | null } | null;
      email = fetched?.email ?? undefined;
    }

    const session = await initiatePremiumCheckoutSession({
      userId: parsed.data.userId,
      customerEmail: email,
    });

    return hiremindJson({
      checkoutUrl: session.checkoutUrl,
      orderId: session.orderId,
      md5sig: session.md5sig,
      fields: session.fields,
    });
  } catch (err) {
    const message = String(err instanceof Error ? err.message : err);

    if (message.includes("PAYHERE_")) {
      return hiremindJson({ error: "payment_misconfigured", message }, {
        status: 502,
      });
    }

    console.error(err);

    return hiremindJson({ error: "payhere_init_failed" }, { status: 500 });
  }
}
