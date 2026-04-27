import { Metadata } from "next";

export const metadata: Metadata = { title: "关于", description: "关于我" };

export default function AboutPage() {
  return (
    <div className="max-w-[680px] mx-auto prose">
      <h1>关于我</h1>
      <p>
        你好！我是 Mokeke，一名热爱技术的开发者。这个博客是我分享技术心得、编程经验和生活感悟的地方。
      </p>
      <h2>技术栈</h2>
      <p>
        这个博客使用 <strong>Next.js</strong>、<strong>MDX</strong>、<strong>Tailwind CSS</strong> 构建，
        部署在 <strong>Cloudflare Pages</strong> 上。
      </p>
      <h2>联系方式</h2>
      <ul>
        <li>GitHub: <a href="https://github.com/mo-ke-ke" target="_blank" rel="noopener noreferrer">@mo-ke-ke</a></li>
        <li>Email: a987384297@qq.com</li>
      </ul>
    </div>
  );
}
