import { Client } from "@notionhq/client";
import {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { NotionToMarkdown } from "notion-to-md";
import * as fs from "fs/promises";
import * as path from "path";
import { imageSize } from "image-size";
import { mdToHTML } from "../app/lib/md-to-html";

// --- Config ---

const DATABASE_ID = "489f42b0a9244c6393451288a880c158";

const STANDALONE_PAGES: Record<string, string> = {
  weekly: "cff234b9bbf0406fb80d410a75661294",
  tests: "175984b6537d4785948ff8e6179cb914",
};

const CONTENT_DIR = path.join(process.cwd(), "content");
const IMAGES_DIR = path.join(process.cwd(), "public", "notion-images");

// --- Notion client ---

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  timeoutMs: 30000,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

// Track images to download: blockId -> url
const imageMap = new Map<string, string>();

// Custom image transformer: use placeholder, collect image info
n2m.setCustomTransformer("image", (node) => {
  if ("type" in node && node.type === "image") {
    const url =
      node.image.type === "file"
        ? node.image.file.url
        : node.image.external.url;
    imageMap.set(node.id, url);
    return `![](/__NOTION_IMAGE__${node.id}__)`;
  }
  return "";
});

// --- Helpers ---

interface PostProperties {
  slug?: string;
  id: string;
  name?: string;
  date: string;
}

function parseProperties<T extends object>(
  properties: PageObjectResponse["properties"]
): Partial<T> {
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
      [k!.toString().toLowerCase(), v],
    ]);
  return Object.fromEntries(parsedProperties);
}

async function getBlocks(
  id: string,
  startCursor?: string
): Promise<BlockObjectResponse[]> {
  const { results, has_more, next_cursor } =
    await notion.blocks.children.list({
      block_id: id,
      page_size: 50,
      start_cursor: startCursor,
    });

  const filteredResults = results.filter(
    (r): r is BlockObjectResponse => "type" in r
  );

  if (has_more && next_cursor) {
    return [...filteredResults, ...(await getBlocks(id, next_cursor))];
  }
  return filteredResults;
}

function findNotesDatabaseId(blocks: BlockObjectResponse[]) {
  return blocks.find((b) => {
    return (
      b.type === "child_database" &&
      b.child_database.title.toLowerCase().startsWith("note")
    );
  })?.id;
}

async function getPageNotes(
  databaseId: string
): Promise<Record<string, string>> {
  const { results } = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  });

  const filteredResults = results.filter(
    (r): r is PageObjectResponse => "properties" in r
  );

  const notes = await Promise.all(
    filteredResults.map(async (notePage) => {
      const blocks = await getBlocks(notePage.id);
      const mdblocks = await n2m.blocksToMarkdown(
        blocks.filter((b) => b.type !== "child_database")
      );
      const md = n2m.toMarkdownString(mdblocks);
      return [notePage.id.replaceAll("-", ""), mdToHTML(md.parent)] as const;
    })
  );

  return Object.fromEntries(notes);
}

async function processPage(id: string) {
  const blocks = await getBlocks(id);
  const mdblocks = await n2m.blocksToMarkdown(
    blocks.filter((b) => b.type !== "child_database")
  );
  const notesDbId = findNotesDatabaseId(blocks);
  const notes = notesDbId ? await getPageNotes(notesDbId) : {};
  const md = n2m.toMarkdownString(mdblocks);
  return { md: md.parent, notes };
}

function extFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
  };
  return map[contentType.split(";")[0].trim()] || ".png";
}

async function downloadImage(
  blockId: string,
  url: string
): Promise<string | null> {
  // Check if image already exists
  const existingFiles = await fs.readdir(IMAGES_DIR).catch(() => []);
  const existing = existingFiles.find((f) => f.startsWith(blockId + "."));
  if (existing) {
    console.log(`  [skip] ${existing} already exists`);
    return existing;
  }

  try {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) {
      console.error(`  [error] Failed to download image ${blockId}: ${response.status}`);
      return null;
    }
    const contentType = response.headers.get("content-type") || "image/png";
    const ext = extFromContentType(contentType);
    const filename = `${blockId}${ext}`;
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(path.join(IMAGES_DIR, filename), buffer);
    console.log(`  [downloaded] ${filename} (${(buffer.length / 1024).toFixed(1)}KB)`);
    return filename;
  } catch (err) {
    console.error(`  [error] Failed to download image ${blockId}:`, err);
    return null;
  }
}

function replaceImagePlaceholders(
  md: string,
  downloadedImages: Map<string, string>
): string {
  return md.replace(
    /!\[\]\(\/__NOTION_IMAGE__([a-f0-9-]+)__\)/g,
    (match, blockId) => {
      const filename = downloadedImages.get(blockId);
      if (filename) {
        return `![](/notion-images/${filename})`;
      }
      console.warn(`  [warn] No downloaded image for block ${blockId}`);
      return match;
    }
  );
}

async function writeJSON(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n");
}

async function writeText(filePath: string, text: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, text);
}

// --- Main sync ---

async function main() {
  console.log("=== Syncing Notion content ===\n");

  // 1. Fetch all published posts
  console.log("Fetching posts from Notion database...");
  const { results } = await notion.databases.query({
    database_id: DATABASE_ID,
    page_size: 100,
    filter: {
      property: "Publish",
      checkbox: { equals: true },
    },
  });

  const posts: PostProperties[] = (results as PageObjectResponse[])
    .map((r) => {
      const props = parseProperties<PostProperties>(
        "properties" in r ? r.properties : {}
      );
      return {
        date: r.created_time,
        ...props,
        slug: props.slug?.trim(),
        id: r.id,
      } as PostProperties;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  console.log(`Found ${posts.length} published posts\n`);

  // 2. Build page ID map
  const pageIdMap: Record<string, string> = {};
  for (const post of posts) {
    if (post.slug) {
      pageIdMap[post.id.replaceAll("-", "")] = post.slug;
    }
  }

  // 3. Write posts.json
  await writeJSON(
    path.join(CONTENT_DIR, "posts.json"),
    posts.map(({ id, slug, name, date }) => ({ id, slug, name, date }))
  );
  console.log("Wrote content/posts.json\n");

  // 4. Process each post
  for (const post of posts) {
    const slug = post.slug ?? post.id;
    console.log(`Processing: ${post.name} (${slug})`);

    const { md, notes } = await processPage(post.id);
    const postDir = path.join(CONTENT_DIR, "posts", slug);

    await writeJSON(path.join(postDir, "meta.json"), {
      id: post.id,
      slug: post.slug,
      name: post.name,
      date: post.date,
    });
    await writeText(path.join(postDir, "index.md"), md);
    await writeJSON(path.join(postDir, "notes.json"), notes);

    console.log(`  Wrote content/posts/${slug}/\n`);
  }

  // 5. Process standalone pages
  for (const [key, pageId] of Object.entries(STANDALONE_PAGES)) {
    console.log(`Processing standalone page: ${key}`);

    const page = await notion.pages.retrieve({ page_id: pageId });
    if (!("properties" in page)) {
      console.error(`  [error] Could not retrieve page ${key}`);
      continue;
    }

    const props = parseProperties<PostProperties>(page.properties);
    const meta = {
      id: page.id,
      name: props.name,
      date: page.created_time,
    };

    pageIdMap[page.id.replaceAll("-", "")] = key;

    const { md, notes } = await processPage(pageId);
    const pageDir = path.join(CONTENT_DIR, "pages", key);

    await writeJSON(path.join(pageDir, "meta.json"), meta);
    await writeText(path.join(pageDir, "index.md"), md);
    await writeJSON(path.join(pageDir, "notes.json"), notes);

    console.log(`  Wrote content/pages/${key}/\n`);
  }

  // 6. Write page-id-map.json
  await writeJSON(path.join(CONTENT_DIR, "page-id-map.json"), pageIdMap);
  console.log("Wrote content/page-id-map.json\n");

  // 7. Download images
  if (imageMap.size > 0) {
    console.log(`Downloading ${imageMap.size} images...`);
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    const downloadedImages = new Map<string, string>();
    const entries = [...imageMap.entries()];

    // Download with concurrency limit of 5
    const CONCURRENCY = 5;
    for (let i = 0; i < entries.length; i += CONCURRENCY) {
      const batch = entries.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        batch.map(([blockId, url]) => downloadImage(blockId, url))
      );
      batch.forEach(([blockId], idx) => {
        if (results[idx]) {
          downloadedImages.set(blockId, results[idx]!);
        }
      });
    }

    // 8. Replace image placeholders in all markdown files
    console.log("\nReplacing image placeholders...");
    const mdFiles = await findAllMdFiles(CONTENT_DIR);
    for (const mdFile of mdFiles) {
      const content = await fs.readFile(mdFile, "utf-8");
      if (content.includes("__NOTION_IMAGE__")) {
        const updated = replaceImagePlaceholders(content, downloadedImages);
        await fs.writeFile(mdFile, updated);
        console.log(`  Updated ${path.relative(process.cwd(), mdFile)}`);
      }
    }
  }

  // 9. Generate image metadata (dimensions)
  console.log("Generating image metadata...");
  const imageFiles = await fs.readdir(IMAGES_DIR).catch(() => []);
  const imageMeta: Record<string, { width: number; height: number }> = {};
  for (const file of imageFiles) {
    const filePath = path.join(IMAGES_DIR, file);
    try {
      const buf = await fs.readFile(filePath);
      const dimensions = imageSize(new Uint8Array(buf));
      if (dimensions.width && dimensions.height) {
        imageMeta[`/notion-images/${file}`] = {
          width: dimensions.width,
          height: dimensions.height,
        };
      }
    } catch {
      // skip unreadable files
    }
  }
  await writeJSON(path.join(CONTENT_DIR, "image-meta.json"), imageMeta);
  console.log(`Wrote image metadata for ${Object.keys(imageMeta).length} images\n`);

  console.log("\n=== Sync complete ===");
}

async function findAllMdFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findAllMdFiles(fullPath)));
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
