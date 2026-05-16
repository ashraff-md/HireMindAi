/**
 * Return an in-app pathname safe to redirect to after auth, or null if unusable.
 * Blocks scheme-relative redirects and external URLs used in open redirects.
 */
export function sanitizeInternalReturnPath(candidate: string | null): string | null {
  if (candidate === null || candidate === undefined || candidate.trim() === "") {
    return null;
  }

  const path = candidate.trim();

  if (!path.startsWith("/")) {
    return null;
  }
  if (path.startsWith("//")) {
    return null;
  }
  if (path.includes("://")) {
    return null;
  }
  // Avoid bouncing back through auth UX in a useless loop.
  if (path === "/login" || path === "/register") {
    return "/dashboard";
  }

  return path;
}
