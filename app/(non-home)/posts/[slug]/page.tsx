import { getPosts } from "../../../../lib/data";
import { PostRenderer } from "./post-renderer";

export default async function Post({ params }) {
  const posts = await getPosts();
  const post = posts.find(p => p.slug === params.slug);

  if (!post) {
    return <div>404 not found</div>;
  } 

  return (
    <>
      <article className="w-full">
        <PostRenderer {...post} />
      </article>
    </>
  );
}

export async function generateStaticParams() {
  const items = await getPosts();
  return items.map((item) => ({
    id: item.id,
    slug: item.slug,
  }));
}

export const revalidate = 60;