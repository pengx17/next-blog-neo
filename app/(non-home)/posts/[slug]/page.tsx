import { Metadata } from "next";

import { getPostBySlug, getPosts } from "../../../lib/notion-data";
import { PostRenderer } from "../../post-renderer";

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return <div>404 not found</div>;
  }

  return (
    <article className="w-full">
      <PostRenderer {...post} />
    </article>
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
export const maxDuration = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.name ? `${post.name} | pengx17` : "pengx17",
    openGraph: {
      images: ["https://avatars.githubusercontent.com/u/584378"],
      description: "A personal blog by pengx17",
    },
  };
}
