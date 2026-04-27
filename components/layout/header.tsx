"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { siteConfig } from "@/lib/constants";

const navItems = [
  { label: "文章", href: "/posts" },
  { label: "标签", href: "/tags" },
  { label: "关于", href: "/about" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-[1200px] mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
          {siteConfig.name}
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm rounded-lg transition-colors",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "text-foreground font-medium"
                  : "text-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}

          <button
            className="ml-2 p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors"
            aria-label="搜索"
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
          >
            <Search className="h-4 w-4" />
          </button>

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
