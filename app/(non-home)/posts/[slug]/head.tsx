import { getPostBySlug } from "../../../lib/notion-data";

/* eslint-disable @next/next/no-page-custom-font */
export default async function Head({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  return (
    <title>
      {post?.name !== undefined ? `${post.name} | pengx17` : "pengx17"}
    </title>
  );
}
