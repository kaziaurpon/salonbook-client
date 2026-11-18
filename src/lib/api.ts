import { authClient } from "@/lib/auth-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function authenticatedApiFetch(path: string, init: RequestInit = {}) {
  const { data, error } = await authClient.token();
  if (error || !data?.token) throw new Error("Your session expired. Please sign in again.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${data.token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(new URL(path, apiUrl), { ...init, headers, cache: "no-store" });
}
