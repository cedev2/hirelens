/**
 * One-time migration: set emailVerified = true on all existing users
 * so they are not locked out after the email-verification feature is merged.
 *
 * Run ONCE before or right after merging the PR:
 *   npx ts-node scripts/migrate-email-verified.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

async function run() {
  if (!MONGO_URI) {
    console.error("MONGO_URI is not set in environment");
    process.exit(1);
  }

  console.log("Connecting to:", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("Connected.");

  const result = await mongoose.connection
    .collection("users")
    .updateMany(
      { emailVerified: { $exists: false } },   // only unset records
      { $set: { emailVerified: true } }
    );

  console.log(`Migration complete: ${result.modifiedCount} user(s) updated to emailVerified=true`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
