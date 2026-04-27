import { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts } from "#site/content";
import { MDXContent } from "@/components/mdx/mdx-content";
import { TableOfContents } from "@/components/posts/toc";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug && p.published);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${siteConfig.url}/posts/${post.slug}`,
    },
  };
}

export async function generateStaticParams() {
  return posts.filter((p) => p.published).map((p) => ({ slug: p.slug }));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="max-w-[680px] mx-auto xl:max-w-none xl:flex xl:justify-center">
      <article className="max-w-[680px] w-full">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> 返回文章列表
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-2 text-sm text-muted mb-3">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">{post.title}</h1>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        <div className="prose">
          <MDXContent code={post.body} />
        </div>
      </article>

      <TableOfContents content={post.body} />
    </div>
  );
}
