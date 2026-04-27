// 交互式删除文章
const readline = require("readline");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

const postsDir = path.join(__dirname, "..", "content", "posts");

function listPosts() {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));
  return files.map((file) => {
    const content = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const titleMatch = content.match(/^title:\s*"?(.+?)"?\s*$/m);
    const dateMatch = content.match(/^date:\s*(.+)$/m);
    return {
      file,
      title: titleMatch ? titleMatch[1] : file,
      date: dateMatch ? dateMatch[1].trim() : "unknown",
    };
  }).sort((a, b) => b.date.localeCompare(a.date));
}

async function main() {
  console.log("\n🗑️  删除文章\n");

  const posts = listPosts();
  if (posts.length === 0) {
    console.log("❌ 没有文章可删除\n");
    process.exit(0);
  }

  posts.forEach((p, i) => {
    console.log(`  ${i + 1}. [${p.date}] ${p.title}`);
    console.log(`     ${p.file}`);
  });

  console.log("");
  const input = await ask(`输入要删除的序号 (1-${posts.length}): `);
  const index = parseInt(input, 10) - 1;

  if (isNaN(index) || index < 0 || index >= posts.length) {
    console.log("❌ 无效的序号");
    rl.close();
    process.exit(1);
  }

  const target = posts[index];
  const confirm = await ask(`\n⚠️  确认删除「${target.title}」? (y/N): `);

  if (confirm.toLowerCase() !== "y") {
    console.log("取消删除\n");
    rl.close();
    return;
  }

  fs.unlinkSync(path.join(postsDir, target.file));
  console.log(`\n✅ 已删除: ${target.file}`);
  console.log(`\n运行 npm run publish 发布变更\n`);
  rl.close();
}

main();
