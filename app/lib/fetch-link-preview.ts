import { getLinkPreview } from "link-preview-js";
import { cache } from "react";

export const fetchLinkPreview = cache(async (url: string) => {
  const startTime = Date.now();
  console.info("fetching " + url);
  const data = await getLinkPreview(Array.isArray(url) ? url[0] : url, {
    timeout: process.env.NODE_ENV === "development" ? 6000 : 500,
    headers: {
      "user-agent": "googlebot",
    },
    followRedirects: "follow",
  });
  console.info("fetched " + url + " in " + (Date.now() - startTime) + "ms");
  return data;
});
