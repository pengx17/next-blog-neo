import { getPageMD, getBlocks, getPageById } from "../../../lib/data";
import { mdToCompiled } from "../../../lib/md-to-compiled";
import { PostRenderer } from "../posts/[slug]/post-renderer";

export default async function Tests() {
  const { md, notes } = await getPageMD("53c58560d34c4dd590d3335dcaa33421");

  const page = await getPageById("53c58560d34c4dd590d3335dcaa33421");
  const { compiledSource } = await mdToCompiled(md);

  return (
    <>
      <h1 className="font-serif text-4xl font-bold my-4">Tests</h1>

      <hr />

      <pre>{md}</pre>
      <pre>{JSON.stringify(notes, null, 2)}</pre>
      <pre>{JSON.stringify(page, null, 2)}</pre>

      <PostRenderer {...page} notes={notes} compiledSource={compiledSource} />
    </>
  );
}
