import { Metadata } from "next";
import Link from "next/link";
import { posts } from "#site/content";

export const metadata: Metadata = { title: "标签", description: "所有文章标签" };

function getAllTags() {
  const tagCount: Record<string, number> = {};
  posts.filter((p) => p.published).forEach((post) => {
    post.tags.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  return Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
}

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="max-w-[680px] mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">标签</h1>
      <p className="text-muted mb-10">共 {tags.length} 个标签</p>
      <div className="flex flex-wrap gap-3">
        {tags.map(([tag, count]) => (
          <Link
            key={tag}
            href={`/tags/${tag}`}
            className="px-4 py-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors text-sm"
          >
            #{tag} <span className="ml-1 text-muted">({count})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
