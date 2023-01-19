import { getPageMD, getBlocks, getPageById } from "../../../lib/data";
import { mdToCompiled } from "../../../lib/md-to-compiled";
import { PostRenderer } from "../posts/[slug]/post-renderer";

export default async function Tests() {
  const { md, notes } = await getPageMD("08b78b3d41fa48c082b783ab3fbada18");

  const page = await getPageById("08b78b3d41fa48c082b783ab3fbada18");
  const { compiledSource } = await mdToCompiled(md);

  return (
    <>
      <h1 className="font-serif text-4xl font-bold my-4">Tests</h1>
      <hr />
      <PostRenderer {...page} notes={notes} compiledSource={compiledSource} />
    </>
  );
}