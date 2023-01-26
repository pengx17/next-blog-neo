import { getPageById } from "../../lib/notion-data";
import { PostRenderer } from "../posts/[slug]/post-renderer";

export default async function Tests() {
  const page = await getPageById("08b78b3d41fa48c082b783ab3fbada18");

  return (
    <>
      <h1 className="font-serif text-4xl font-bold my-4">Tests</h1>
      <hr />
      <PostRenderer {...page} />
    </>
  );
}