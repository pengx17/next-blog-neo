import { serialize } from "next-mdx-remote/serialize";
import { cache } from "react";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";

export const mdToCompiled = cache(async (md: string) => {
  return await serialize(md, {
    mdxOptions: {
      development: process.env.NODE_ENV !== "production",
      remarkPlugins: [],
      rehypePlugins: [rehypePrism, rehypeSlug],
    },
  });
});
