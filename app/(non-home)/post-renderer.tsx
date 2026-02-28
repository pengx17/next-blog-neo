import { MDXRemote } from "next-mdx-remote/rsc";

import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { use } from "react";
import { getMdxComponents } from "../components/mdx-components";
import { DateString } from "../date";
import { getPageMD, type PostProperties } from "../lib/content-data";

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
        source={md}
        components={getMdxComponents({
          notes,
        })}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypeShiki, { themes: { light: "github-light" } }],
            ],
          },
        }}
      />
    </>
  );
}
