import { loadEnvFile } from "node:process";
import { MongoClient } from "mongodb";

try { loadEnvFile(".env.local"); } catch { try { loadEnvFile(".env"); } catch { /* env may be supplied by the shell */ } }

async function provisionAdmin() {
  if (!process.argv.includes("--confirm-admin-provision")) {
    throw new Error("Admin creation is CLI-only. Re-run with --confirm-admin-provision.");
  }

  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const mongoUri = process.env.MONGODB_URI;
  const authSecret = process.env.BETTER_AUTH_SECRET;
  if (!name || !email || !password || !mongoUri || !authSecret || authSecret.length < 32) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI, and a 32+ character BETTER_AUTH_SECRET in your private environment.");
  }
  if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    throw new Error("Admin password must be at least 6 characters and include uppercase and lowercase letters.");
  }

  const { auth } = await import("../src/lib/auth.js");
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME || undefined);
    const users = db.collection<{ _id: string; email: string }>("users");
    // Better Auth's MongoDB adapter maps its logical user.id to MongoDB's _id field.
    let userId = (await users.findOne({ email }, { projection: { _id: 1 } }))?._id;

    if (!userId) {
      const result = await auth.api.signUpEmail({ body: { name, email, password } });
      if (!result.user?.id) throw new Error("Better Auth did not return the newly created account.");
      userId = result.user.id;
    }

    const update = await users.updateOne(
      { _id: userId },
      { $set: { role: "admin", isBlocked: false } },
    );
    if (update.matchedCount !== 1) throw new Error("The new Better Auth user record could not be promoted.");
    console.log(`Admin account provisioned for ${email}. The password was not printed.`);
  } finally {
    await client.close();
  }
}

void provisionAdmin().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unexpected error.";
  console.error(`Admin provisioning failed: ${message}`);
  process.exitCode = 1;
});
