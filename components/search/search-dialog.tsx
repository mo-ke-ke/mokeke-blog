"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SearchItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
}

interface SearchDialogProps {
  posts: SearchItem[];
}

export function SearchDialog({ posts }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = query.trim()
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : [];

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleOpen();
      }
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleOpen, handleClose]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (slug: string) => {
    handleClose();
    router.push(`/posts/${slug}`);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex].slug);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-2xl border border-border bg-background shadow-2xl"
          >
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search className="h-4 w-4 text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="搜索文章..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="flex-1 py-4 text-sm bg-transparent outline-none placeholder:text-muted"
              />
              <button onClick={handleClose} className="text-muted hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {query.trim() && (
              <div className="max-h-80 overflow-y-auto p-2">
                {results.length === 0 ? (
                  <p className="text-center text-sm text-muted py-8">未找到相关文章</p>
                ) : (
                  results.map((post, i) => (
                    <button
                      key={post.slug}
                      onClick={() => handleSelect(post.slug)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors",
                        selectedIndex === i ? "bg-accent/10" : "hover:bg-card-hover"
                      )}
                    >
                      <FileText className="h-4 w-4 mt-0.5 text-muted shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{post.title}</p>
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">{post.description}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 px-4 py-2 border-t border-border text-xs text-muted">
              <span><kbd className="px-1.5 py-0.5 rounded bg-card-hover font-mono">↑↓</kbd> 导航</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-card-hover font-mono">↵</kbd> 打开</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-card-hover font-mono">Esc</kbd> 关闭</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
