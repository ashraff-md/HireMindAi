import crypto from "node:crypto";

function md5Upper(input: string) {
  return crypto.createHash("md5").update(input, "utf8").digest("hex").toUpperCase();
}

export function hashedMerchantSecretUpper(merchantSecret: string) {
  return md5Upper(merchantSecret.trim());
}

/**
 * Offline checkout POST signature (sandbox + live use the same string composition).
 *
 * md5_upper( merchant_id + order_id + amount + currency + md5_upper(merchant_secret) )
 */
export function signCheckoutRequest(args: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  amount: number | string;
  currency: string;
}) {
  const merchantId = args.merchantId.trim();
  const orderId = args.orderId.trim();
  const amountStr = typeof args.amount === "number"
    ? args.amount.toFixed(2)
    : args.amount.trim();
  const currency = args.currency.trim();
  const secretUpper = hashedMerchantSecretUpper(args.merchantSecret);

  return md5Upper(`${merchantId}${orderId}${amountStr}${currency}${secretUpper}`);
}

/**
 * Server Notify verification:
 * md5_upper( merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5_upper(merchant_secret) )
 *
 * Concatenate ALL values as plain strings exactly as PayHere posts them when possible.
 */
export function signNotifyPayload(args: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  payhereAmountRaw: string;
  payhereCurrencyRaw: string;
  statusCodeRaw: string;
}) {
  const secretUpper = hashedMerchantSecretUpper(args.merchantSecret);

  const preimage =
    `${args.merchantId.trim()}`
    + `${args.orderId.trim()}`
    + `${args.payhereAmountRaw.trim()}`
    + `${args.payhereCurrencyRaw.trim()}`
    + `${args.statusCodeRaw.trim()}`
    + secretUpper;

  return md5Upper(preimage);
}

export function normalizePayHereAmount(amount: number | string) {
  const n = typeof amount === "number" ? amount : Number(amount);

  if (!Number.isFinite(n)) {
    throw new TypeError("Invalid PayHere amount.");
  }

  return n.toFixed(2);
}
