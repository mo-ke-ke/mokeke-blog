// 交互式创建新文章
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log("\n✨ 创建新文章\n");

  const title = await ask("📝 文章标题: ");
  if (!title.trim()) { console.log("❌ 标题不能为空"); process.exit(1); }

  const tagsInput = await ask("🏷️  标签 (逗号分隔，可留空): ");
  const tags = tagsInput.trim() ? tagsInput.split(/[,，]/).map((t) => t.trim()).filter(Boolean) : [];

  const desc = await ask("📄 摘要描述 (可留空): ");

  const slug = slugify(title);
  const date = new Date().toISOString().split("T")[0];
  const filename = `${slug}.mdx`;
  const filepath = path.join(__dirname, "..", "content", "posts", filename);

  if (fs.existsSync(filepath)) {
    console.log(`❌ 文件已存在: content/posts/${filename}`);
    process.exit(1);
  }

  const frontmatter = `---
title: "${title}"
slug: ${slug}
date: ${date}
description: "${desc || title}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
published: true
---

在这里开始写文章...
`;

  fs.writeFileSync(filepath, frontmatter, "utf-8");
  console.log(`\n✅ 文章已创建: content/posts/${filename}`);
  console.log(`\n📂 用编辑器打开编辑，写完后运行:\n`);
  console.log(`   npm run publish\n`);

  // 尝试用 VS Code 打开
  try {
    execSync(`code "${filepath}"`, { stdio: "ignore" });
    console.log("🚀 已用 VS Code 打开文件\n");
  } catch {
    // VS Code 未安装，忽略
  }

  rl.close();
}

main();
