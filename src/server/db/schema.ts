import { relations, sql } from "drizzle-orm";
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
    content: varchar("content", { length: 300 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
    userId: varchar("user_id").notNull(),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.content),
    userIdIndex: index("user_id_idx").on(example.userId),
  }),
);

export const postsRelations = relations(posts, ({ many }) => ({
  hearts: many(hearts),
}));

export const hearts = pgTable(
  "heart",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id").notNull(),
    userId: varchar("user_id").notNull(),
  },
  (example) => ({
    postIdIndex: index("post_id_idx").on(example.postId),
    userIdIndex: index("user_id_idx").on(example.userId),
  }),
);

export const heartsRelations = relations(hearts, ({ one }) => ({
  post: one(posts, {
    fields: [hearts.postId],
    references: [posts.id],
  }),
}));
