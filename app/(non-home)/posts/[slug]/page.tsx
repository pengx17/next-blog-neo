import { getPosts } from "../../../lib/notion-data";
import { PostRenderer } from "./post-renderer";

export default async function Post({ params }) {
  const posts = await getPosts();
  const post = posts.find(
    (p) => p.slug === params.slug || p.id === params.slug
  );

  if (!post) {
    return <div>404 not found</div>;
  }

  return (
    <div className="w-full">
      <PostRenderer {...post} />
    </div>
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
