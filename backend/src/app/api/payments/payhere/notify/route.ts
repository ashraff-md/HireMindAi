import { processPayHereNotify } from "@/services/payment.service";

export const runtime = "nodejs";

/** PayHere posts `application/x-www-form-urlencoded`; `request.formData()` parses key/value pairs. */

export async function POST(request: Request) {
  const form = await request.formData();

  const payload: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string") {
      payload[key] = value;
    }
  });

  const result = await processPayHereNotify(payload);

  return new Response(result.body, {
    status: result.status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
