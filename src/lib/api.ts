import { authClient } from "@/lib/auth-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiTimeoutError extends Error {
  constructor() {
    super("This is taking longer than expected. Please try again.");
    this.name = "ApiTimeoutError";
  }
}

export async function withRequestTimeout<T>(
  request: (signal: AbortSignal) => Promise<T>,
  options: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<T> {
  if (options.signal?.aborted) {
    throw options.signal.reason ?? new DOMException("The request was aborted.", "AbortError");
  }
  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener("abort", abortFromCaller, { once: true });
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
      reject(new ApiTimeoutError());
    }, options.timeoutMs ?? 15_000);
  });
  try {
    return await Promise.race<T>([request(controller.signal), timeoutPromise]);
  } catch (error) {
    if (timedOut) throw new ApiTimeoutError();
    throw error;
  } finally {
    if (timeout) clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abortFromCaller);
  }
}

export async function authenticatedApiFetch(path: string, init: RequestInit = {}) {
  const { signal: externalSignal, ...requestInit } = init;
  return withRequestTimeout(async (signal) => {
    const { data, error } = await authClient.token();
    if (error || !data?.token) throw new Error("Your session expired. Please sign in again.");

    const headers = new Headers(requestInit.headers);
    headers.set("Authorization", `Bearer ${data.token}`);
    if (requestInit.body && !(requestInit.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(new URL(path, apiUrl), { ...requestInit, signal, headers, cache: "no-store" });
  }, { signal: externalSignal ?? undefined });
}
