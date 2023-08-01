import { MDXRemote } from "next-mdx-remote/rsc";

import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { use } from "react";
import { getMdxComponents } from "../components/mdx-components";
import { DateString } from "../date";
import { getPageMD, type PostProperties } from "../lib/notion-data";
import rehypeShiki from "../lib/rehype-shiki";

export function PostRenderer({ id, name, date }: Partial<PostProperties>) {
  if (!id) {
    return null;
  }
  const { md, notes } = use(getPageMD(id));
  return (
    <>
      <h1 className="my-6 text-4xl font-serif font-bold leading-snug">
        {name}
      </h1>
      {date && (
        <div className="text-gray-600 mb-8 ml-0.5">
          <DateString dateString={date} />
        </div>
      )}
      {/* @ts-ignore */}
      <MDXRemote
        options={{
          mdxOptions: {
            // development: process.env.NODE_ENV !== "production",
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeShiki],
          },
        }}
        source={md}
        // @ts-expect-error Server Component
        components={getMdxComponents({
          notes,
        })}
      />
    </>
  );
}
