type AuthFeedback = { type: "success" | "error"; message: string };

const AUTH_FEEDBACK_KEY = "salonbook:auth-feedback";

export function queueAuthFeedback(feedback: AuthFeedback) {
  window.sessionStorage.setItem(AUTH_FEEDBACK_KEY, JSON.stringify(feedback));
}

export function consumeAuthFeedback(): AuthFeedback | null {
  const stored = window.sessionStorage.getItem(AUTH_FEEDBACK_KEY);
  if (!stored) return null;
  window.sessionStorage.removeItem(AUTH_FEEDBACK_KEY);
  try {
    const parsed = JSON.parse(stored) as Partial<AuthFeedback>;
    if ((parsed.type === "success" || parsed.type === "error") && typeof parsed.message === "string") {
      return { type: parsed.type, message: parsed.message };
    }
  } catch {
    return null;
  }
  return null;
}
