import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * With this, you can use the same database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const pgTable = pgTableCreator((name) => `postparrot_${name}`);

export const posts = pgTable(
  "post",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    content: varchar("content", { length: 256 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").default(sql`CURRENT_TIMESTAMP`),
    userId: varchar("user_id").notNull(),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.content),
  }),
);
