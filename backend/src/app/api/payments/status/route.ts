import { hiremindJson } from "@/lib/hiremind-response";

export const runtime = "nodejs";

/** Placeholder until a payment provider is integrated (checkout + webhook). */
export function GET() {
  return hiremindJson({
    status: "not_configured",
    message: "Payment gateway — to be implemented.",
  });
}
