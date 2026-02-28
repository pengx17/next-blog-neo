import { getStandalonePage } from "../../../lib/content-data";
import { PostRenderer } from "../../post-renderer";

export default async function Post() {
  const page = await getStandalonePage("weekly");

  if (!page) {
    return null;
  }

  return (
    <article className="w-full">
      <h1 className="font-serif text-4xl font-bold mt-4 mb-2">我的周报</h1>
      <PostRenderer name={page.name} id={page.id} />
    </article>
  );
}
