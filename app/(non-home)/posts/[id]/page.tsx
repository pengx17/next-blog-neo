import { getPostById, getPosts } from "../../../../lib/data";

export default async function Post({ params }) {
  const [] = await getPostById(params.id);
  return (
    <>
      <article className="w-full">
        <>
          <section></section>
          TODO
        </>
      </article>
    </>
  );
}

export async function generateStaticParams() {
  const items = await getPosts();
  return items.map((item) => ({
    id: item.id,
  }));
}
