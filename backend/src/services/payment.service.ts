import crypto from "node:crypto";

import {
  normalizePayHereAmount,
  signCheckoutRequest,
  signNotifyPayload,
} from "@/lib/payhere";
import { getSupabaseAdmin } from "@/lib/supabase";

export function timingSafeHexEquals(a: string, b: string): boolean {
  const x = Buffer.from(a.trim(), "utf8");
  const y = Buffer.from(b.trim(), "utf8");

  if (x.length !== y.length) {
    return false;
  }

  return crypto.timingSafeEqual(x, y);
}

export function requirePayHereCheckoutEnv(): {
  merchantId: string;
  merchantSecret: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  checkoutUrl: string;
  premiumAmountFormatted: string;
  currency: string;
} {
  const merchantId = process.env.PAYHERE_MERCHANT_ID?.trim();
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET?.trim();
  const returnUrl = process.env.PAYHERE_RETURN_URL?.trim();
  const cancelUrl = process.env.PAYHERE_CANCEL_URL?.trim();
  const notifyUrl = process.env.PAYHERE_NOTIFY_URL?.trim();

  if (!merchantId) {
    throw new Error("PAYHERE_MERCHANT_ID is required.");
  }

  if (!merchantSecret) {
    throw new Error("PAYHERE_MERCHANT_SECRET is required.");
  }

  if (!returnUrl) {
    throw new Error("PAYHERE_RETURN_URL is required.");
  }

  if (!cancelUrl) {
    throw new Error("PAYHERE_CANCEL_URL is required.");
  }

  if (!notifyUrl) {
    throw new Error(
      "PAYHERE_NOTIFY_URL is required — use your public HTTPS base, e.g. ${APP_PUBLIC_BASE_URL}/api/payments/payhere/notify.",
    );
  }

  const checkoutUrl = process.env.PAYHERE_CHECKOUT_BASE_URL?.trim()
    || "https://sandbox.payhere.lk/pay/checkout";

  const configuredAmount =
    process.env.PAYHERE_PREMIUM_AMOUNT?.trim() || "1999";
  const premiumAmountFormatted = normalizePayHereAmount(configuredAmount);
  const currency = process.env.PAYHERE_CURRENCY?.trim() || "LKR";

  return {
    merchantId,
    merchantSecret,
    returnUrl,
    cancelUrl,
    notifyUrl,
    checkoutUrl,
    premiumAmountFormatted,
    currency,
  };
}

/** Creates a pending `payment_orders` row and checksum for PayHere hosted checkout POST. */
export async function initiatePremiumCheckoutSession(input: {
  userId: string;
  customerEmail?: string;
}) {
  const envBundle = requirePayHereCheckoutEnv();
  const orderId = `HM_${crypto.randomUUID()}`;

  const amountNumber = Number.parseFloat(envBundle.premiumAmountFormatted);

  const supabase = getSupabaseAdmin();

  const { error: insertError } = await supabase.from("payment_orders").insert({
    order_id: orderId,
    user_id: input.userId,
    amount: amountNumber,
    currency: envBundle.currency,
    status: "pending",
    metadata: {
      initiated_at: new Date().toISOString(),
      source: "payhere_hosted_checkout",
    },
  });

  if (insertError) {
    throw insertError;
  }

  const md5sig = signCheckoutRequest({
    merchantId: envBundle.merchantId,
    merchantSecret: envBundle.merchantSecret,
    orderId,
    amount: envBundle.premiumAmountFormatted,
    currency: envBundle.currency,
  });

  const email =
    input.customerEmail?.trim()
    || process.env.PAYHERE_CHECKOUT_FALLBACK_EMAIL?.trim()
    || "customer@example.com";

  const fields: Record<string, string> = {
    merchant_id: envBundle.merchantId,
    return_url: envBundle.returnUrl,
    cancel_url: envBundle.cancelUrl,
    notify_url: envBundle.notifyUrl,
    order_id: orderId,
    items: process.env.PAYHERE_ORDER_TITLE?.trim() || "HireMind Premium plan",
    currency: envBundle.currency,
    amount: envBundle.premiumAmountFormatted,
    first_name:
      process.env.PAYHERE_CHECKOUT_FIRST_NAME?.trim() || "HireMind",
    last_name: process.env.PAYHERE_CHECKOUT_LAST_NAME?.trim() || "Candidate",
    email,
    phone: process.env.PAYHERE_CHECKOUT_PHONE?.trim() || "0770000000",
    address:
      process.env.PAYHERE_CHECKOUT_ADDRESS?.trim() || "N/A",
    city: process.env.PAYHERE_CHECKOUT_CITY?.trim() || "Colombo",
    country: process.env.PAYHERE_CHECKOUT_COUNTRY?.trim() || "LK",
    md5sig,
  };

  return {
    checkoutUrl: envBundle.checkoutUrl,
    orderId,
    md5sig,
    fields,
  };
}

/** Verifies Notify MD5 (`payment_id`) and delegates idempotent fulfillment to Postgres RPC. */
export async function processPayHereNotify(
  payload: Record<string, string>,
): Promise<{ status: number; body: string }> {
  const merchantIdCfg = process.env.PAYHERE_MERCHANT_ID?.trim();
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET?.trim();

  if (!merchantIdCfg || !merchantSecret) {
    return {
      status: 500,
      body: "server_misconfigured",
    };
  }

  const merchantId = payload["merchant_id"] ?? "";
  const orderId = payload["order_id"] ?? "";
  const paymentId = payload["payment_id"] ?? "";
  const payhereAmount = payload["payhere_amount"] ?? "";
  const payhereCurrency = payload["payhere_currency"] ?? "";
  const statusCode = payload["status_code"] ?? "";
  const md5sig = payload["md5sig"] ?? "";

  if (!merchantId || !orderId || !paymentId || !payhereAmount || !md5sig) {
    return { status: 400, body: "missing_notify_fields" };
  }

  if (merchantId !== merchantIdCfg) {
    return { status: 403, body: "merchant_mismatch" };
  }

  const recomputed = signNotifyPayload({
    merchantId,
    merchantSecret,
    orderId,
    payhereAmountRaw: payhereAmount,
    payhereCurrencyRaw: payhereCurrency,
    statusCodeRaw: statusCode,
  });

  const expectedMd5sig = recomputed.trim().toUpperCase();
  const receivedMd5sig = md5sig.trim().toUpperCase();

  if (!timingSafeHexEquals(expectedMd5sig, receivedMd5sig)) {
    return { status: 403, body: "signature_mismatch" };
  }

  const statusCodeParsed = Number.parseInt(statusCode, 10);

  const supabase = getSupabaseAdmin();
  const amtNumber = Number.parseFloat(payhereAmount);

  const { data, error } = await supabase.rpc("complete_payhere_order", {
    p_order_id: orderId,
    p_payhere_payment_id: paymentId,
    p_payhere_amount: amtNumber,
    p_payhere_currency: payhereCurrency,
    p_status_code: Number.isFinite(statusCodeParsed) ? statusCodeParsed : -999,
  });

  if (error) {
    return { status: 500, body: "rpc_failure" };
  }

  const result = data as Record<string, unknown>;

  if (result?.["error"]) {
    return {
      status: 409,
      body: String(result["error"]),
    };
  }

  return { status: 200, body: "OK" };
}
