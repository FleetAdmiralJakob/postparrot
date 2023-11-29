import { migrate } from "drizzle-orm/vercel-postgres/migrator";
import { db } from "~/server/db/index";

async function main() {
  await migrate(db, { migrationsFolder: "drizzle/migrations" });
  process.exit(0);
}

void main();
