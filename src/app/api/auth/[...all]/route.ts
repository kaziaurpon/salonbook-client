import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const handlers = toNextJsHandler(auth);

function hasAuthConfiguration() {
  return Boolean(
    process.env.MONGODB_URI
      && process.env.BETTER_AUTH_SECRET
      && process.env.BETTER_AUTH_SECRET.length >= 32,
  );
}

function unavailable() {
  return Response.json(
    { message: "Authentication is not configured. Set MONGODB_URI and a BETTER_AUTH_SECRET of at least 32 characters." },
    { status: 503 },
  );
}

export const GET: typeof handlers.GET = (request) => hasAuthConfiguration()
  ? handlers.GET(request)
  : Promise.resolve(unavailable());
export const POST: typeof handlers.POST = (request) => hasAuthConfiguration()
  ? handlers.POST(request)
  : Promise.resolve(unavailable());
