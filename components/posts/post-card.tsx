"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface PostCardProps {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export function PostCard({ slug, title, description, date, tags }: PostCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href={`/posts/${slug}`}
        className="group block p-6 -mx-6 rounded-2xl hover:bg-card-hover transition-colors duration-200"
      >
        <div className="flex items-center gap-2 text-sm text-muted mb-2">
          <time dateTime={date}>{formatDate(date)}</time>
          {tags.length > 0 && (
            <>
              <span>·</span>
              <div className="flex gap-1.5">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-accent">#{tag}</span>
                ))}
              </div>
            </>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">{title}</h2>
        <p className="text-muted text-sm leading-relaxed line-clamp-2">{description}</p>

        <div className="mt-4 flex items-center gap-1 text-sm text-accent opacity-0 group-hover:opacity-100 transition-opacity">
          阅读全文 <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </Link>
    </motion.article>
  );
}
