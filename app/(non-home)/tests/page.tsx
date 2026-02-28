import { getStandalonePage } from "../../lib/content-data";
import { PostRenderer } from "../post-renderer";

export default async function Tests() {
  const page = await getStandalonePage("tests");

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
