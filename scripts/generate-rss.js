// @ts-check
// 构建后生成 RSS feed + Sitemap 静态文件
const fs = require("fs");
const path = require("path");

const SITE_URL = "https://mokeke.pages.dev";
const SITE_NAME = "Mokeke's Blog";
const SITE_DESC = "一个使用 Next.js 构建的极简个人博客";

function loadPosts() {
  const veliteDir = path.join(__dirname, "..", ".velite");
  const postsFile = path.join(veliteDir, "posts.json");
  if (!fs.existsSync(postsFile)) {
    console.log("[postbuild] No posts.json found, skipping");
    return null;
  }
  const posts = JSON.parse(fs.readFileSync(postsFile, "utf-8"));
  return posts
    .filter((/** @type {any} */ p) => p.published)
    .sort((/** @type {any} */ a, /** @type {any} */ b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function generateRSS(posts, outDir) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESC}</description>
    <language>zh-CN</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (/** @type {any} */ post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/posts/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/posts/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  fs.writeFileSync(path.join(outDir, "feed.xml"), xml, "utf-8");
  console.log(`[postbuild] Generated feed.xml with ${posts.length} posts`);
}

function generateSitemap(posts, outDir) {
  const today = new Date().toISOString().split("T")[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}</loc><lastmod>${today}</lastmod></url>
  <url><loc>${SITE_URL}/posts</loc><lastmod>${today}</lastmod></url>
  <url><loc>${SITE_URL}/tags</loc><lastmod>${today}</lastmod></url>
  <url><loc>${SITE_URL}/about</loc><lastmod>${today}</lastmod></url>
  ${posts
    .map(
      (/** @type {any} */ post) =>
        `<url><loc>${SITE_URL}/posts/${post.slug}</loc><lastmod>${new Date(post.date).toISOString().split("T")[0]}</lastmod></url>`
    )
    .join("\n  ")}
</urlset>`;

  fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml, "utf-8");
  console.log(`[postbuild] Generated sitemap.xml`);
}

function main() {
  const outDir = path.join(__dirname, "..", "out");
  if (!fs.existsSync(outDir)) {
    console.log("[postbuild] out/ directory not found, skipping");
    return;
  }

  const posts = loadPosts();
  if (!posts) return;

  generateRSS(posts, outDir);
  generateSitemap(posts, outDir);
}

main();
