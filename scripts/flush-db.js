/**
 * Flush HabitFlow collections from MongoDB.
 *
 * Usage:
 *   node scripts/flush-db.js --yes
 *
 * Requires:
 *   MONGODB_URI
 */

import mongoose from "mongoose";



const COLLECTIONS = ["users", "habits", "habitlogs", "aiweeklyreports"];

function hasYesFlag(argv) {
  return argv.includes("--yes") || argv.includes("--confirm") || argv.includes("-y");
}

async function main() {
  const MONGODB_URI=""

  const uri = MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  if (!hasYesFlag(process.argv.slice(2))) {
    throw new Error(
      "Refusing to flush DB. Re-run with --yes (example: npm run db:flush)"
    );
  }

  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not ready");

  const results = {};
  for (const name of COLLECTIONS) {
    // Only delete if the collection exists; avoids creating new empty collections.
    const exists = (await db.listCollections({ name }).toArray()).length > 0;
    if (!exists) {
      results[name] = 0;
      continue;
    }
    const res = await db.collection(name).deleteMany({});
    results[name] = res.deletedCount || 0;
  }

  console.log("Flushed collections:", results);
}

main()
  .catch((e) => {
    console.error(e && e.message ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {}
  });

