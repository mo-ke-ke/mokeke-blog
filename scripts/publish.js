// 一键发布：git add + commit + push
const { execSync } = require("child_process");

function run(cmd) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function main() {
  console.log("\n🚀 发布博客\n");

  // 检查是否有改动
  const status = execSync("git status --porcelain", { encoding: "utf-8" }).trim();
  if (!status) {
    console.log("✅ 没有需要发布的改动\n");
    return;
  }

  console.log("📦 改动文件:");
  status.split("\n").forEach((line) => console.log(`   ${line}`));
  console.log("");

  // 提取新增/修改的文章文件名作为 commit message
  const postChanges = status
    .split("\n")
    .filter((l) => l.includes("content/posts/"))
    .map((l) => l.replace(/^.+content\/posts\//, "").replace(/\.mdx$/, ""));

  const message = postChanges.length > 0
    ? `发布文章: ${postChanges.join(", ")}`
    : "更新博客";

  run("git add -A");
  run(`git commit -m "${message}"`);
  run("git push");

  console.log("\n✅ 发布成功！Cloudflare 将在 1-2 分钟内自动部署\n");
  console.log("🌐 访问: https://mokeke.pages.dev\n");
}

main();
