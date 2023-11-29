import Image from "next/image";
import dayjs from "dayjs";
import { type InferSelectModel } from "drizzle-orm";
import { type posts } from "~/server/db/schema";

import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import HeartComponent from "./heart";

dayjs.extend(relativeTime);

export interface Posts extends InferSelectModel<typeof posts> {
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

const PostView = ({ posts }: { posts: Posts[] }) => {
  if (posts.length === 0) {
    return <div>No posts yet</div>;
  }

  return (
    <div className="flex max-h-full w-3/5 flex-col gap-3 overflow-x-hidden overflow-y-scroll md:w-2/5">
      {posts.map((post) => {
        return (
          <div key={post.id} className="mb-4 flex items-center gap-4">
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
                <HeartComponent
                  hearts={post.hearts}
                  heartedByMe={post.heartedByMe}
                  postId={post.id}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PostView;
