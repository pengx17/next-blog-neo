import { getPageMD, getPosts } from "../../../../lib/data";
import { mdToCompiled } from "../../../../lib/md-to-compiled";
import { cacheTwitterEmbedsAst } from "../../../../lib/scan-embeds";
import { PostRenderer } from "./post-renderer";

export default async function Post({ params }) {
  const posts = await getPosts();
  const post = posts.find(
    (p) => p.slug === params.slug || p.id === params.slug
  );

  if (!post) {
    return <div>404 not found</div>;
  }

  const { md, notes } = await getPageMD(post.id);
  const tweetAstMap = await cacheTwitterEmbedsAst(md);
  const { compiledSource } = await mdToCompiled(md);

  return (
    <article className="w-full">
      <PostRenderer
        {...post}
        notes={notes}
        tweetAstMap={tweetAstMap}
        compiledSource={compiledSource}
      />
    </article>
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
