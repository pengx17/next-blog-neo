import { getPostBySlug } from "../../../lib/notion-data";

/* eslint-disable @next/next/no-page-custom-font */
export default async function Head({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return null;
  }
  return (
    <>
      <title>{post.name ? `${post.name} | pengx17` : "pengx17"}</title>
    </>
  );
}
