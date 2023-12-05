import Image from "next/image";
import dayjs from "dayjs";
import { type InferSelectModel } from "drizzle-orm";
import { type comments, type posts } from "~/server/db/schema";

import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import HeartComponent from "./heart";
import { CreatePost } from "~/app/_components/create-post";
import { MessageCircle } from "lucide-react";

dayjs.extend(relativeTime);

export interface Post extends InferSelectModel<typeof posts> {
  imageUrl: string;
  username: string;
  hearts: number;
  heartedByMe: boolean;
  mostHeartedComment?: Comment;
  commentAmount: number;
}

export interface PostWithComments extends InferSelectModel<typeof posts> {
  imageUrl: string;
  username: string;
  hearts: number;
  heartedByMe: boolean;
  mostHeartedComment?: Comment;
  commentAmount: number;
  comments: Comment[];
}

export interface Comment extends InferSelectModel<typeof comments> {
  imageUrl: string;
  username: string;
  hearts: number;
  heartedByMe: boolean;
}

function replaceNewlineWithBrTag(text: string) {
  return (text || "").split("\n").map((item, key) => {
    return (
      <span key={key}>
        {item}
        <br />
      </span>
    );
  });
}

const PostView = ({
  posts,
  replies,
}:
  | {
      posts: Post[];
      replies?: false;
    }
  | {
      posts: PostWithComments[];
      replies?: true;
    }) => {
  if (posts.length === 0) {
    return <div>No posts yet</div>;
  }

  return (
    <div className="flex max-h-full w-3/5 flex-col gap-3 overflow-x-hidden overflow-y-scroll md:w-2/5">
      {posts.map((post, index) => {
        return (
          <div key={post.id}>
            {index !== 0 && <hr className="mr-2 border-gray-500" />}
            <div className="flex flex-col items-center" key={post.id}>
              <div className="mb-4 flex w-full items-center gap-4 text-left">
                <Link href={`/user/${post.userId}`}>
                  <Image
                    src={post.imageUrl}
                    alt={post.username + "'s profile picture"}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                </Link>
                <div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/post/${post.id}`}>
                      <p className="pb-1 text-sm font-bold text-gray-500">
                        {post.username} · {dayjs(post.createdAt).fromNow()}
                      </p>
                      <p className="font-bold">
                        {replaceNewlineWithBrTag(post.content)}
                      </p>
                    </Link>
                    <div className="flex gap-2">
                      <HeartComponent
                        hearts={post.hearts}
                        heartedByMe={post.heartedByMe}
                        postId={post.id}
                      />
                      <div className="flex items-center gap-1">
                        <MessageCircle />
                        {post.commentAmount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {post.mostHeartedComment && !replies && (
                <div className="mb-4 flex w-full items-center gap-4 pl-7">
                  <Link
                    href={`/user/${post.mostHeartedComment.userId}`}
                    className="relative"
                  >
                    <Image
                      src={post.mostHeartedComment.imageUrl}
                      alt={
                        post.mostHeartedComment.username + "'s profile picture"
                      }
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  </Link>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="pb-1 text-sm font-bold text-gray-500">
                        {post.mostHeartedComment.username} ·{" "}
                        {dayjs(post.mostHeartedComment.createdAt).fromNow()}
                      </p>
                      <p className="font-bold">
                        {replaceNewlineWithBrTag(
                          post.mostHeartedComment.content,
                        )}
                      </p>
                    </div>
                    <HeartComponent
                      hearts={post.mostHeartedComment.hearts}
                      heartedByMe={post.mostHeartedComment.heartedByMe}
                      commentId={post.mostHeartedComment.id}
                    />
                  </div>
                </div>
              )}
              {replies && (
                <CreatePost comment={{ postId: post.id }} className="pb-5" />
              )}
              {"comments" in post
                ? replies &&
                  post.comments.map((comment: Comment) => {
                    return (
                      <div
                        key={comment.id}
                        className="mb-4 flex w-full items-center gap-4 pl-7"
                      >
                        <Link
                          href={`/user/${comment.userId}`}
                          className="relative"
                        >
                          <Image
                            src={comment.imageUrl}
                            alt={comment.username + "'s profile picture"}
                            width={50}
                            height={50}
                            className="rounded-full"
                          />
                        </Link>
                        <div className="flex flex-col gap-2">
                          <div>
                            <p className="pb-1 text-sm font-bold text-gray-500">
                              {comment.username} ·{" "}
                              {dayjs(comment.createdAt).fromNow()}
                            </p>
                            <p className="font-bold">
                              {replaceNewlineWithBrTag(comment.content)}
                            </p>
                          </div>
                          <HeartComponent
                            hearts={comment.hearts}
                            heartedByMe={comment.heartedByMe}
                            commentId={comment.id}
                          />
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PostView;
