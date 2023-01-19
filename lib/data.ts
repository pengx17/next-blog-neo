import { Client } from "@notionhq/client";
import {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { NotionToMarkdown } from "notion-to-md";
import { cache } from "react"; // tbh I don't know what it is ...
import { lazy } from "./lazy";
import { mdToHTML } from "./md-to-html";

const databaseId = "489f42b0a9244c6393451288a880c158";

// Initializing a client
const notion = lazy(() => {
  return new Client({ auth: process.env.NOTION_TOKEN, timeoutMs: 5000 });
});

const n2m = lazy(() => new NotionToMarkdown({ notionClient: notion.value }));

const parseProperties = <T extends object>(
  properties: PageObjectResponse["properties"]
): T => {
  const parsedProperties = Object.entries(properties)
    .map(([key, value]) => {
      switch (value.type) {
        case "rich_text":
          return [key, value.rich_text?.[0].plain_text];
        case "title":
          return [key, value.title?.[0].plain_text];
        case "number":
          return [key, value.number];
        case "checkbox":
          return [key, value.checkbox];
        case "date":
          return [key, value.date?.start];
        default:
          return [key, value];
      }
    })
    .filter(([, v]) => v != null)
    .flatMap(([k, v]) => [
      [k, v],
      [k.toString().toLowerCase(), v],
    ]);
  return Object.fromEntries(parsedProperties);
};

export interface PostProperties {
  slug: string;
  id: string;
  name: string;
  date: string;
}

export const getPosts = cache(async (retry = 3) => {
  try {
    const start = performance.now();
    console.log("getting all posts from Notion API ...");
    const { results } = await notion.value.databases.query({
      database_id: databaseId,
      page_size: 100, // should be enough
      filter: {
        property: "Publish",
        checkbox: {
          equals: true,
        },
      },
    });

    const flattenedResults = (
      results as PageObjectResponse[]
    ).map<PostProperties>((r) => {
      return {
        id: r.id,
        date: r.created_time,
        ...parseProperties("properties" in r ? r.properties : {}),
      };
    });

    flattenedResults.sort((a, b) => b.date.localeCompare(a.date));

    console.log(
      `getting all posts took ${(performance.now() - start).toFixed(2)}ms`
    );
    return flattenedResults;
  } catch (e) {
    console.error(e);
    if (retry > 0) {
      return getPosts(retry - 1);
    }
    return [];
  }
});

const getPostBlocks = async (
  id: string,
  startCursor?: string
): Promise<BlockObjectResponse[]> => {
  const { results, has_more, next_cursor } =
    await notion.value.blocks.children.list({
      block_id: id,
      page_size: 50,
      start_cursor: startCursor,
    });

  const filteredResults = results
    .filter((r) => "type" in r)
    .map((r: BlockObjectResponse) => r);

  if (has_more) {
    return [...filteredResults, ...(await getPostBlocks(id, next_cursor))];
  } else {
    return filteredResults;
  }
};

export const getPostById = cache(async (id: string) => {
  const start = performance.now();
  const page = await notion.value.pages.retrieve({
    page_id: id,
  });

  if (!("properties" in page)) {
    return null;
  }

  const blocks = await getPostBlocks(page.id);

  const result = {
    id: page.id,
    date: page.created_time,
    ...parseProperties<PostProperties>(page.properties),
    blocks: blocks,
  };

  console.log(
    `getPostById took ${(performance.now() - start).toFixed(2)}ms for ${id}`
  );

  return result;
});

const getCommentsForBlocks = cache(async (blocks: BlockObjectResponse[]) => {
  const comments = (
    await Promise.all(
      blocks.map(async (block) => {
        try {
          const { results } = await notion.value.comments.list({
            block_id: block.id,
          });
          return results;
        } catch (_) {
          return [];
        }
      })
    )
  ).flat();

  return comments;
});

export const getPostHTML = cache(async (id: string) => {
  try {
    const start = performance.now();
    const post = await getPostById(id);
    const mdblocks = await n2m.value.blocksToMarkdown(post.blocks);

    const md = n2m.value.toMarkdownString(mdblocks);

    let html = await mdToHTML(md);

    console.log(
      `getPostHTML took ${(performance.now() - start).toFixed(2)}ms for ${id}`
    );
    return html;
  } catch (err) {
    console.error(err);
    return "failed to get post";
  }
});

export const getPostMD = cache(async (id: string) => {
  try {
    const start = performance.now();
    const post = await getPostById(id);
    const mdblocks = await n2m.value.blocksToMarkdown(post.blocks);

    const md = n2m.value.toMarkdownString(mdblocks);

    console.log(
      `getPostMD took ${(performance.now() - start).toFixed(2)}ms for ${id}`
    );
    return md;
  } catch (err) {
    console.error(err);
    return "failed to get post";
  }
});
