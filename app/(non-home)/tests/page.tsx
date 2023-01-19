import fsp from "fs/promises";

import path from "path";
import { mdToCompiled } from "../../../lib/md-to-compiled";
import { PostRenderer } from "../posts/[slug]/post-renderer";

import { cacheTwitterEmbedsAst } from '../../../lib/scan-embeds'

export default async function Tests() {
  const md = await fsp.readFile(
    path.resolve(process.cwd(), "./test.md"),
    "utf-8"
  );

  const { compiledSource } = await mdToCompiled(md);
  const tweetAstMap = await cacheTwitterEmbedsAst(md);

  return (
    <>
      <h1 className="font-serif text-4xl font-bold my-4">Tests</h1>

      <hr />

      <PostRenderer
        id="test"
        slug="test"
        tweetAstMap={tweetAstMap}
        compiledSource={compiledSource}
        name="test"
        date="2021-01-01"
      />
    </>
  );
}
