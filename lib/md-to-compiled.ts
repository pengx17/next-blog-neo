import { serialize } from "next-mdx-remote/serialize";
import { cache } from "react";
import rehypeAddClasses from "rehype-add-classes";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";

export const mdToCompiled = cache(async (md: string) => {
  return await serialize(md, {
    mdxOptions: {
      development: process.env.NODE_ENV !== 'production',
      remarkPlugins: [],
      rehypePlugins: [
        rehypePrism,
        rehypeSlug,
        [
          rehypeAddClasses,
          {
            h1: "font-serif text-3xl font-bold my-12 mb-8",
            h2: "font-serif text-2xl font-bold mt-12 mb-8",
            h3: "font-serif text-xl font-bold mt-8 mb-6",
            h4: "font-serif text-xl font-bold my-4 text-gray-800",
            hr: "my-6 h-1.5 border-gray-400 border-t border-b my-4",
            blockquote: "my-6 py-0.5 px-4 border-green-900 border-l-4",
            pre: "my-6 text-[13px] p-4 !bg-gray-100 leading-ease w-full overflow-auto rounded",
            ul: "my-6 list-disc pl-10 leading-ease",
            ol: "my-6 list-decimal pl-10 leading-ease",
            p: "my-6 leading-ease",
            "code:not(.code-highlight)": "inline-code",
            a: "underline",
          },
        ],
      ],
    },
  });
})