import { cache } from "react";
import { fetchTweetAst } from "static-tweets";
import { getTweetIdFromUrl } from "./utils";

export const getEmbedUrls = (md: string) => {
  const embedsRegex = /\[embed\]\((.*)\)/g;
  const matches = md.matchAll(embedsRegex);
  return [...matches].map((m) => m[1]);
};

const tweetAstPromiseCache = new Map<string, Promise<any>>();
const tweetAstCache = new Map<string, any>();

export const cacheTwitterEmbedsAst = cache(async (md: string) => {
  const ids = getEmbedUrls(md).map(getTweetIdFromUrl).filter(Boolean) as string[];
  try {
    const cache = await Promise.all(
      ids.map(async (id) => {
        const start = performance.now();
        let p = tweetAstPromiseCache.get(id);
        if (!p) {
          p = fetchTweetAst(id);
          tweetAstPromiseCache.set(id, p);
          const ast = await p;
          console.log(
            `fetchTweetAst took ${(performance.now() - start).toFixed(
              2
            )}ms for ${id}`
          );
          tweetAstCache.set(id, ast);
        }
        return [id, await p] as const;
      })
    );
    return Object.fromEntries(cache);
  } catch (err) {
    console.log(err);
    return [];
  }
});

export const getTweetAst = (id: string) => {
  return tweetAstCache.get(id);
};
