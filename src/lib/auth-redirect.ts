export type AccountRole = "admin" | "customer";

const ADMIN_HOME = "/dashboard/admin";
const CUSTOMER_HOME = "/";
const INTERNAL_ORIGIN = "https://salonbook.invalid";

/** Accept only same-site absolute paths, including paths that stay safe after decoding. */
export function safeInternalPath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;

  let candidate = value;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (candidate.startsWith("//") || candidate.includes("\\")) return null;
    let parsed: URL;
    try {
      parsed = new URL(candidate, INTERNAL_ORIGIN);
    } catch {
      return null;
    }
    if (parsed.origin !== INTERNAL_ORIGIN || parsed.username || parsed.password) return null;

    let decoded: string;
    try {
      decoded = decodeURIComponent(candidate);
    } catch {
      return null;
    }
    if (decoded === candidate) return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    candidate = decoded;
  }

  // Excessively nested encoding is ambiguous; fail closed.
  return null;
}

export function postAuthPath(role: string | undefined, callbackUrl: unknown): string {
  if (role === "admin") return ADMIN_HOME;
  return safeInternalPath(callbackUrl) ?? CUSTOMER_HOME;
}

export function authCompletePath(callbackUrl: unknown): string {
  const safe = safeInternalPath(callbackUrl);
  return safe ? `/auth/complete?${new URLSearchParams({ callbackUrl: safe }).toString()}` : "/auth/complete";
}

export function loginPathFor(requestedPath: string): string {
  const safe = safeInternalPath(requestedPath);
  return safe ? `/login?${new URLSearchParams({ callbackUrl: safe }).toString()}` : "/login";
}
