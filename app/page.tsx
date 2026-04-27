import Link from "next/link";
import { posts } from "#site/content";
import { PostList } from "@/components/posts/post-list";
import { SearchDialog } from "@/components/search/search-dialog";
import { ArrowRight } from "lucide-react";

const sortedPosts = posts
  .filter((p) => p.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default function HomePage() {
  const latestPosts = sortedPosts.slice(0, 5);

  return (
    <div className="max-w-[680px] mx-auto">
      <section className="py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          你好，欢迎来到我的博客 👋
        </h1>
        <p className="text-lg text-muted leading-relaxed">
          在这里我分享关于技术、编程和生活的思考。
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold">最新文章</h2>
          <Link
            href="/posts"
            className="flex items-center gap-1 text-sm text-accent hover:underline underline-offset-4"
          >
            查看全部 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <PostList posts={latestPosts} />
      </section>

      <SearchDialog posts={sortedPosts.map((p) => ({ slug: p.slug, title: p.title, description: p.description, tags: p.tags }))} />
    </div>
  );
}
