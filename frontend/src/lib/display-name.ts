/** Turn `alex.rivers@gmail.com` into "Alex Rivers" for greetings. */
export function displayNameFromEmail(email: string | null): string {
  if (!email) return "Explorer";
  const raw = email.split("@")[0] ?? "";
  return raw
    .replace(/[._+-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .trim() || "Explorer";
}
