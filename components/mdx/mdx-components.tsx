import * as React from "react";
import Image from "next/image";
import { Callout } from "@/components/mdx/callout";
import { MdxFigure } from "@/components/mdx/special-code-block";

export const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} />,
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h4 {...props} />,
  figure: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>) => <MdxFigure {...props} />,
  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <Image
      src={src ?? ""}
      alt={alt ?? ""}
      width={720}
      height={400}
      className="rounded-xl"
      {...(props as any)}
    />
  ),
  Callout,
};
