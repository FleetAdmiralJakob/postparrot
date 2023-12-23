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
  comments: many(comments),
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

export const comments = pgTable(
  "comment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    content: varchar("content", { length: 300 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
    postId: uuid("post_id").notNull(),
    userId: varchar("user_id").notNull(),
  },
  (example) => ({
    postIdIndex: index("post_id_idx").on(example.postId),
    userIdIndex: index("user_id_idx").on(example.userId),
  }),
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  commentHearts: many(commentHearts),
}));

export const commentHearts = pgTable(
  "comment_heart",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    commentId: uuid("comment_id").notNull(),
    userId: varchar("user_id").notNull(),
  },
  (example) => ({
    commentIdIndex: index("comment_id_idx").on(example.commentId),
    userIdIndex: index("user_id_idx").on(example.userId),
  }),
);

export const commentHeartsRelations = relations(commentHearts, ({ one }) => ({
  comment: one(comments, {
    fields: [commentHearts.commentId],
    references: [comments.id],
  }),
}));

// Files for posts or comments
export const files = pgTable(
  "file",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 300 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    url: varchar("url", { length: 300 }).notNull(),
    key: varchar("key", { length: 300 }).notNull(),
    uploadedBy: varchar("uploaded_by").notNull(),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
    urlIndex: index("url_idx").on(example.url),
    keyIndex: index("key_idx").on(example.key),
  }),
);
