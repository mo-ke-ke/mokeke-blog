import { PostCard } from "@/components/posts/post-card";

interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="text-center text-muted py-16">暂无文章</p>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {posts.map((post) => (
        <PostCard key={post.slug} {...post} />
      ))}
    </div>
  );
}
