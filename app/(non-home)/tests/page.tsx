import { getPageById } from "../../lib/notion-data";
import { PostRenderer } from "../posts/[slug]/post-renderer";

export default async function Tests() {
  const page = await getPageById("175984b6537d4785948ff8e6179cb914");

  if (!page) {
    return null;
  }

  return (
    <>
      <h1 className="font-serif text-4xl font-bold my-4">Tests</h1>
      <hr />
      <PostRenderer {...page} />
    </>
  );
}
