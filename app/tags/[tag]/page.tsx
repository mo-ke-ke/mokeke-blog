import { Metadata } from "next";
import { posts } from "#site/content";
import { PostList } from "@/components/posts/post-list";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${decodeURIComponent(tag)}`, description: `包含标签 #${decodeURIComponent(tag)} 的文章` };
}

export async function generateStaticParams() {
  const tags = new Set<string>();
  posts.filter((p) => p.published).forEach((p) => p.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).map((tag) => ({ tag }));
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const filtered = posts
    .filter((p) => p.published && p.tags.includes(decodedTag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-[680px] mx-auto">
      <Link href="/tags" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回标签
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-2">#{decodedTag}</h1>
      <p className="text-muted mb-10">共 {filtered.length} 篇文章</p>
      <PostList posts={filtered} />
    </div>
  );
}
