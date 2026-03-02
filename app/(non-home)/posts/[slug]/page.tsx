import { Metadata } from "next";

import {
  getPostBySlug,
  getPostContentBySlug,
  getPosts,
} from "../../../lib/content-data";
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

export const dynamic = "force-static";
export const dynamicParams = false;

type Props = {
  params: Promise<{ slug: string }>;
};

function extractDescription(md: string, maxLen = 180): string | undefined {
  const text = md
    // remove common markdown constructs
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/[\*_~>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return undefined;
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const title = post.name ? `${post.name} | pengx17` : "pengx17";
  const content = await getPostContentBySlug(slug);
  const description =
    (content?.md ? extractDescription(content.md) : undefined) ||
    "A personal blog by pengx17";

  const images = ["https://avatars.githubusercontent.com/u/584378"];

  return {
    title,
    description,
    alternates: {
      canonical: `/posts/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/posts/${slug}`,
      type: "article",
      images,
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
