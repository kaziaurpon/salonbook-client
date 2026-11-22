import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { loginPathFor, safeInternalPath } from "@/lib/auth-redirect";

type Role = "admin" | "customer";

// Dashboard layouts are nested, so a single navigation can otherwise query the
// auth database more than once while rendering the same request.
const getRequestSession = cache(async () => {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  return { requestHeaders, session };
});

export async function requireSalonBookUser(requiredRole?: Role) {
  const { requestHeaders, session } = await getRequestSession();
  const requestPath = safeInternalPath(requestHeaders.get("x-salonbook-request-path")) ?? "/";

  if (!session) redirect(loginPathFor(requestPath));

  const user = session.user as typeof session.user & { role?: Role; isBlocked?: boolean };
  if (user.isBlocked) redirect("/account/blocked");

  if (requiredRole && user.role !== requiredRole) {
    redirect(user.role === "admin" ? "/dashboard/admin" : "/");
  }

  return user;
}
