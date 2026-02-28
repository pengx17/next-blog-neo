interface Env {
  ALLOWED_ORIGINS?: string; // comma-separated, e.g. "https://pengx17.vercel.app,https://pengx17.pages.dev"
}

interface LinkMeta {
  url: string;
  title?: string;
  siteName?: string;
  description?: string;
  images?: string[];
  favicons?: string[];
  contentType?: string;
  mediaType?: string;
}

function corsHeaders(origin: string, allowedOrigins: string[]): HeadersInit {
  const isAllowed =
    allowedOrigins.length === 0 || allowedOrigins.includes(origin);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (isAllowed && origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function parseMetaTags(html: string, url: string): LinkMeta {
  const meta: LinkMeta = { url };
  const images: string[] = [];
  const favicons: string[] = [];

  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) {
    meta.title = decodeEntities(titleMatch[1].trim());
  }

  // Extract meta tags
  const metaRegex = /<meta\s+([^>]*?)\/?>/gi;
  let match;
  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = match[1];
    const property =
      getAttr(attrs, "property") || getAttr(attrs, "name") || "";
    const content = getAttr(attrs, "content") || "";

    if (!content) continue;

    switch (property.toLowerCase()) {
      case "og:title":
        meta.title = decodeEntities(content);
        break;
      case "og:description":
      case "description":
        if (!meta.description) meta.description = decodeEntities(content);
        break;
      case "og:image":
        images.push(resolveUrl(content, url));
        break;
      case "og:site_name":
        meta.siteName = decodeEntities(content);
        break;
      case "og:type":
        meta.mediaType = content;
        break;
    }
  }

  // Extract favicons
  const linkRegex = /<link\s+([^>]*?)\/?>/gi;
  while ((match = linkRegex.exec(html)) !== null) {
    const attrs = match[1];
    const rel = getAttr(attrs, "rel") || "";
    const href = getAttr(attrs, "href") || "";
    if (rel.includes("icon") && href) {
      favicons.push(resolveUrl(href, url));
    }
  }

  if (images.length) meta.images = images;
  if (favicons.length) meta.favicons = favicons;
  meta.contentType = "text/html";

  return meta;
}

function getAttr(attrs: string, name: string): string | null {
  const regex = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i");
  const m = attrs.match(regex);
  return m ? m[1] : null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const cors = corsHeaders(origin, allowedOrigins);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return Response.json(
        { error: "Missing url parameter" },
        { status: 400, headers: cors }
      );
    }

    // Validate URL: only allow http/https and block private/internal IPs
    try {
      const parsed = new URL(targetUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return Response.json(
          { error: "Only http and https URLs are allowed" },
          { status: 400, headers: cors }
        );
      }
      const hostname = parsed.hostname;
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "0.0.0.0" ||
        hostname === "::1" ||
        hostname.startsWith("10.") ||
        hostname.startsWith("192.168.") ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
        hostname.endsWith(".local") ||
        hostname.endsWith(".internal")
      ) {
        return Response.json(
          { error: "Private/internal URLs are not allowed" },
          { status: 400, headers: cors }
        );
      }
    } catch {
      return Response.json(
        { error: "Invalid URL" },
        { status: 400, headers: cors }
      );
    }

    // Check cache
    const cacheKey = new Request(request.url, { method: "GET" });
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) {
      const response = new Response(cached.body, {
        status: cached.status,
        headers: cached.headers,
      });
      Object.entries(cors).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    }

    try {
      const resp = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Googlebot/2.1",
          Accept: "text/html",
        },
        redirect: "follow",
      });

      const contentType = resp.headers.get("content-type") || "";

      if (!contentType.includes("text/html")) {
        const result: LinkMeta = {
          url: targetUrl,
          contentType: contentType.split(";")[0].trim(),
        };
        const response = Response.json(result, {
          headers: { ...cors, "Cache-Control": "public, max-age=86400" },
        });
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
        return response;
      }

      const html = await resp.text();
      const meta = parseMetaTags(html, targetUrl);

      const response = Response.json(meta, {
        headers: { ...cors, "Cache-Control": "public, max-age=86400" },
      });
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch (err) {
      return Response.json(
        {
          url: targetUrl,
          contentType: "placeholder",
          error: String(err),
        },
        { status: 502, headers: cors }
      );
    }
  },
};
