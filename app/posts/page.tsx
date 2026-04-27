import { Metadata } from "next";
import { posts } from "#site/content";
import { PostList } from "@/components/posts/post-list";

export const metadata: Metadata = {
  title: "文章",
  description: "所有博客文章",
};

const sortedPosts = posts
  .filter((p) => p.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default function PostsPage() {
  return (
    <div className="max-w-[680px] mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">文章</h1>
      <p className="text-muted mb-10">共 {sortedPosts.length} 篇文章</p>
      <PostList posts={sortedPosts} />
    </div>
  );
}
