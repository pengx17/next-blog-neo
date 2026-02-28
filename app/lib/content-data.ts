import * as fs from "fs/promises";
import * as path from "path";
import { cache } from "react";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface PostProperties {
  slug?: string;
  id: string;
  name?: string;
  date: string;
}

export const getPosts = cache(async (): Promise<PostProperties[]> => {
  const data = await fs.readFile(
    path.join(CONTENT_DIR, "posts.json"),
    "utf-8"
  );
  return JSON.parse(data);
});

export const getPostBySlug = cache(
  async (slug: string): Promise<PostProperties | undefined> => {
    const posts = await getPosts();
    return posts.find((p) => p.slug === slug || p.id === slug);
  }
);

const getPageIdMap = cache(async (): Promise<Record<string, string>> => {
  const data = await fs.readFile(
    path.join(CONTENT_DIR, "page-id-map.json"),
    "utf-8"
  );
  return JSON.parse(data);
});

async function readPageContent(
  dir: string
): Promise<{ md: string; notes: Record<string, string> }> {
  const [md, notesStr] = await Promise.all([
    fs.readFile(path.join(dir, "index.md"), "utf-8"),
    fs.readFile(path.join(dir, "notes.json"), "utf-8"),
  ]);
  return { md, notes: JSON.parse(notesStr) };
}

export const getPageMD = cache(
  async (
    id: string
  ): Promise<{ md: string; notes?: Record<string, string> }> => {
    const normalizedId = id.replaceAll("-", "");

    // Try posts first
    const posts = await getPosts();
    const post = posts.find(
      (p) => p.id === id || p.id.replaceAll("-", "") === normalizedId
    );

    if (post) {
      const slug = post.slug ?? post.id;
      return readPageContent(path.join(CONTENT_DIR, "posts", slug));
    }

    // Try standalone pages via page-id-map
    const pageIdMap = await getPageIdMap();
    const key = pageIdMap[normalizedId];
    if (key) {
      try {
        return await readPageContent(path.join(CONTENT_DIR, "pages", key));
      } catch {
        // fall through
      }
    }

    return { md: "Page not found" };
  }
);

// For link_to_page resolution — returns metadata only
export const getPageMetaById = cache(
  async (
    id: string
  ): Promise<{ slug?: string; name?: string } | null> => {
    const normalizedId = id.replaceAll("-", "");

    // Check posts first
    const posts = await getPosts();
    const post = posts.find(
      (p) => p.id.replaceAll("-", "") === normalizedId
    );
    if (post) {
      return { slug: post.slug, name: post.name };
    }

    // Check standalone pages
    const pageIdMap = await getPageIdMap();
    const key = pageIdMap[normalizedId];
    if (key) {
      try {
        const metaStr = await fs.readFile(
          path.join(CONTENT_DIR, "pages", key, "meta.json"),
          "utf-8"
        );
        const meta = JSON.parse(metaStr);
        return { slug: key, name: meta.name };
      } catch {
        // fall through
      }
    }

    return null;
  }
);

// Image dimensions metadata
export const getImageMeta = cache(
  async (): Promise<Record<string, { width: number; height: number }>> => {
    try {
      const data = await fs.readFile(
        path.join(CONTENT_DIR, "image-meta.json"),
        "utf-8"
      );
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
);

// For standalone pages (weekly, tests)
export const getStandalonePage = cache(
  async (key: string): Promise<PostProperties | null> => {
    try {
      const metaStr = await fs.readFile(
        path.join(CONTENT_DIR, "pages", key, "meta.json"),
        "utf-8"
      );
      return JSON.parse(metaStr);
    } catch {
      return null;
    }
  }
);
