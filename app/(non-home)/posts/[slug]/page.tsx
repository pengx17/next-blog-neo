import { getPostBySlug, getPosts } from "../../../lib/notion-data";
import { PostRenderer } from "../../post-renderer";

export default async function Post({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

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
    slug: item.slug ?? item.id, // fallback to id if slug is not defined
  }));
}

export const revalidate = 60;
