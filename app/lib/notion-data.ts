import { Client } from "@notionhq/client";
import {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { NotionToMarkdown } from "notion-to-md";
// https://beta.nextjs.org/docs/data-fetching/caching#per-request-caching
import { cache } from "react";
import { lazy } from "./lazy";
import { mdToHTML } from "./md-to-html";

const databaseId = "489f42b0a9244c6393451288a880c158";

// Initializing a client
const notion = lazy(() => {
  return new Client({
    auth: process.env.NOTION_TOKEN,
    timeoutMs: 10000,
    fetch: global.fetch,
  });
});

const n2m = lazy(() => {
  const _n2m = new NotionToMarkdown({ notionClient: notion.value });
  _n2m.setCustomTransformer("image", (node) => {
    if ("type" in node && node.type === "image") {
      const src = `/api/notion-image?id=${node.id}&last_edited_time=${node.last_edited_time}`;
      return `![](${src})`;
    }
    return "";
  });
  return _n2m;
});

const parseProperties = <T extends object>(
  properties: PageObjectResponse["properties"]
): Partial<T> => {
  const parsedProperties = Object.entries(properties)
    .map(([key, value]) => {
      switch (value.type) {
        case "rich_text":
          return [key, value.rich_text?.[0]?.plain_text];
        case "title":
          return [key, value.title?.[0]?.plain_text];
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
      // @ts-ignore
      [k.toString().toLowerCase(), v],
    ]);
  return Object.fromEntries(parsedProperties);
};

export interface PostProperties {
  slug?: string;
  id: string;
  name?: string;
  date: string;
}

export const getPosts = cache(async (retry = 3): Promise<PostProperties[]> => {
  try {
    const start = performance.now();
    console.log(`getting all posts from Notion API ...(${retry})`);
    const { results } = await notion.value.databases.query({
      database_id: databaseId,
      page_size: 100, // should be enough
      filter:
        process.env.NODE_ENV === "production"
          ? {
              property: "Publish",
              checkbox: { equals: true },
            }
          : undefined,
    });

    const flattenedResults = (results as PageObjectResponse[]).map((r) => {
      return {
        date: r.created_time,
        ...parseProperties("properties" in r ? r.properties : {}),
        id: r.id,
      } as PostProperties;
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

export const getPostBySlug = cache(
  async (slug: string): Promise<PostProperties | undefined> => {
    const posts = await getPosts();
    return posts.find((p) => p.slug === slug || p.id === slug);
  }
);

export const getBlocks = cache(
  async (id: string, startCursor?: string): Promise<BlockObjectResponse[]> => {
    const { results, has_more, next_cursor } =
      await notion.value.blocks.children.list({
        block_id: id,
        page_size: 50,
        start_cursor: startCursor,
      });

    // @ts-ignore
    const filteredResults: BlockObjectResponse[] = results.filter(
      (r) => "type" in r
    );

    if (has_more && next_cursor) {
      return [...filteredResults, ...(await getBlocks(id, next_cursor))];
    } else {
      return filteredResults;
    }
  }
);

export const getBlock = cache(async (id: string) => {
  const start = performance.now();
  const result = await notion.value.blocks.retrieve({
    block_id: id,
  });

  if (!("type" in result)) {
    return null;
  }

  console.log(
    `getBlock took ${(performance.now() - start).toFixed(2)}ms for ${id}`
  );

  return result;
});

// in my case, I have an inline database named "notes" which contains the notes of the page
const findNotesDatabaseId = (blocks: BlockObjectResponse[]) => {
  return blocks.find((b) => {
    return (
      b.type === "child_database" &&
      b.child_database.title.toLowerCase().startsWith("note")
    );
  })?.id;
};

const getPageNotes = cache(async (database_id: string) => {
  const start = performance.now();

  const { results } = await notion.value.databases.query({
    database_id: database_id,
    page_size: 100, // should be enough
  });

  const filteredResults = results.filter<PageObjectResponse>(
    // @ts-ignore
    (r) => "properties" in r
  );

  const notes = await Promise.all(
    filteredResults.map(async (notePage) => {
      const blocks = await getBlocks(notePage.id);
      const mdblocks = await n2m.value.blocksToMarkdown(
        blocks.filter((b) => {
          return b.type !== "child_database";
        })
      );
      const md = n2m.value.toMarkdownString(mdblocks);
      return [notePage.id.replaceAll("-", ""), mdToHTML(md.parent)] as const;
    })
  );

  console.log(
    `getPageNotes took ${(performance.now() - start).toFixed(
      2
    )}ms for ${database_id}`
  );

  return Object.fromEntries(notes);
});

export const getPageById = cache(async (id: string, fetchBlocks = true) => {
  const start = performance.now();
  const page = await notion.value.pages.retrieve({
    page_id: id,
  });

  if (!("properties" in page)) {
    return null;
  }

  const result = {
    date: page.created_time,
    ...parseProperties<PostProperties>(page.properties),
    id: page.id,
    parent: page.parent,
  };

  if (fetchBlocks) {
    const blocks = await getBlocks(page.id);
    Object.assign(result, { blocks });
  }

  console.log(
    `getPageById took ${(performance.now() - start).toFixed(2)}ms for ${id}`
  );

  return result;
});

export const getPageMD = cache(async (id: string) => {
  try {
    console.log("getting page blocks and notes from Notion API ...");
    const start = performance.now();
    const blocks = await getBlocks(id);
    const mdblocks = await n2m.value.blocksToMarkdown(
      blocks.filter((b) => {
        return b.type !== "child_database";
      })
    );
    const notesDbId = findNotesDatabaseId(blocks);
    const notes = notesDbId ? await getPageNotes(notesDbId) : {};
    const md = n2m.value.toMarkdownString(mdblocks);

    console.log(
      `getPostMD took ${(performance.now() - start).toFixed(2)}ms for ${id}`
    );
    return { md: md.parent, notes };
  } catch (err) {
    console.error(err);
    return { md: "failed to get post" };
  }
});
