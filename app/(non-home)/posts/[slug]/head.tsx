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
      <meta name="description" content="A personal blog by pengx17" />
      <meta
        name="twitter:card"
        content="https://avatars.githubusercontent.com/u/584378"
      />
      <meta
        name="og:image"
        content="https://avatars.githubusercontent.com/u/584378"
      />
    </>
  );
}
